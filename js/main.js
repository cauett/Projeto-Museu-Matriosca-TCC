import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import {
  onSelect,
  configureWallUtils,
  isWallPlaced,
  setExibicaoAtiva,
} from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null,
  localSpace = null,
  sessionStarted = false,
  pendingExibicao = null,
  startRequested = false,
  arSupported = null;

const uiControls = initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada); // envia a exibição para wall-utils
  pendingExibicao = exibicaoSelecionada;
  startRequested = true;
  tryStartARSession();
});

const {
  setARAvailability = () => {},
  showARUnavailableFeedback = () => {},
} = uiControls ?? {};
setARAvailability({
  supported: null,
  message: "Verificando compatibilidade do dispositivo...",
});

function tryStartARSession() {
  if (!startRequested || !pendingExibicao) return;
  if (arSupported === null || !arButton) {
    return;
  }
  if (!arSupported || !arButton || arButton.tagName !== "BUTTON") {
    showARUnavailableFeedback(
      !arSupported
        ? "Realidade aumentada não suportada neste dispositivo."
        : "Não foi possível iniciar a realidade aumentada."
    );
    startRequested = false;
    pendingExibicao = null;
    return;
  }
  if (sessionStarted) {
    startRequested = false;
    pendingExibicao = null;
    return;
  }
  arButton.click();
  sessionStarted = true;
  startRequested = false;
  pendingExibicao = null;
}

(async function init() {
  const sceneObjects = await setupARScene(THREE, ARButton, onSelect);
  camera = sceneObjects.camera;
  scene = sceneObjects.scene;
  renderer = sceneObjects.renderer;
  controller = sceneObjects.controller;
  reticle = sceneObjects.reticle;
  arButton = sceneObjects.arButton;

  if (arButton && arButton.tagName === "BUTTON") {
    const text = (arButton.textContent || "").toLowerCase();
    arSupported = !text.includes("not supported");
    arButton.style.display = "none";
    arButton.setAttribute("aria-hidden", "true");
  } else {
    arSupported = false;
  }

  setARAvailability({
    supported: arSupported,
    message: arSupported ? "" : "Realidade aumentada não suportada neste dispositivo.",
  });

  if (pendingExibicao) {
    setExibicaoAtiva(pendingExibicao);
  }
  tryStartARSession();

  configureWallUtils({
    THREELib: THREE,
    cameraRef: camera,
    sceneRef: scene,
    reticleRef: reticle,
  });

  renderer.xr.addEventListener("sessionstart", async () => {
    const session = renderer.xr.getSession();
    localSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: localSpace });

    document.getElementById("ui").style.display = "none";
  });

  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame && hitTestSource) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0 && !isWallPlaced()) {
        const pose = hitTestResults[0].getPose(referenceSpace);
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }

    renderer.render(scene, camera);
  });
})();
