import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import { onSelect, configureWallUtils, isWallPlaced, setExibicaoAtiva } from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null, localSpace = null;
let pendingARState = null;
let arStateActive = false;

const AR_SCREEN_STATE = "ar";

function pushARHistoryState(exibicao) {
  if (!window?.history?.pushState) return;
  window.history.pushState(
    { screen: AR_SCREEN_STATE, exibicaoId: exibicao?.id },
    "",
    "#ar",
  );
}

const { showDetailsScreen } = initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada); // envia a exibição para wall-utils
  pendingARState = exibicaoSelecionada;
  if (arButton) {
    arButton.click(); // inicia AR
  }
});

(async function init() {
  const sceneObjects = await setupARScene(THREE, ARButton, onSelect);
  camera = sceneObjects.camera;
  scene = sceneObjects.scene;
  renderer = sceneObjects.renderer;
  controller = sceneObjects.controller;
  reticle = sceneObjects.reticle;
  arButton = sceneObjects.arButton;

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

    if (pendingARState) {
      pushARHistoryState(pendingARState);
      arStateActive = true;
    }
  });

  renderer.xr.addEventListener("sessionend", () => {
    hitTestSource = null;
    localSpace = null;
    if (reticle) {
      reticle.visible = false;
    }

    const ui = document.getElementById("ui");
    if (ui) {
      ui.style.display = "";
    }

    if (arStateActive && window.history.state?.screen === AR_SCREEN_STATE) {
      window.history.back();
    } else if (typeof showDetailsScreen === "function") {
      showDetailsScreen({ skipHistory: true });
    }

    arStateActive = false;
    pendingARState = null;
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

window.addEventListener("popstate", () => {
  if (renderer?.xr?.isPresenting) {
    const session = renderer.xr.getSession();
    session?.end();
  }
});
