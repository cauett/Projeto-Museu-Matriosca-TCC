import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import { onSelect, configureWallUtils, isWallPlaced, setExibicaoAtiva } from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null, localSpace = null;
const arOverlay = document.getElementById("ar-overlay");
const arBackBtn = document.getElementById("ar-back-btn");
let arBackButtonHandler = null;
let activeXRSession = null;
let arStateActive = false;
let arClosingViaHistory = false;

const uiApi = initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada); // envia a exibição para wall-utils
  arButton.click(); // inicia AR
});

function handleHistoryNavigationDuringAR(event) {
  if (!activeXRSession || !arStateActive) return;
  if (event.state?.screen === "ar") return;
  arClosingViaHistory = true;
  activeXRSession.end();
}

window.addEventListener("popstate", handleHistoryNavigationDuringAR);

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
    activeXRSession = session;
    arClosingViaHistory = false;
    localSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: localSpace });

    const exibicaoAtual = uiApi?.getCurrentExibicao?.();
    if (exibicaoAtual) {
      uiApi?.pushArState?.(exibicaoAtual.id);
      arStateActive = true;
    } else {
      arStateActive = false;
    }

    const uiLayer = document.getElementById("ui");
    if (uiLayer) {
      uiLayer.dataset.previousDisplay = uiLayer.style.display || "";
      uiLayer.style.display = "none";
    }

    if (arOverlay) {
      arOverlay.hidden = false;
    }

    if (arBackBtn) {
      arBackBtn.disabled = false;
      arBackButtonHandler = () => {
        arBackBtn.disabled = true;
        if (arStateActive && window.history.length > 1) {
          arClosingViaHistory = true;
          window.history.back();
        } else {
          session.end();
        }
      };
      arBackBtn.addEventListener("click", arBackButtonHandler);
    }

    const handleSessionEnd = () => {
      session.removeEventListener("end", handleSessionEnd);
      if (uiLayer) {
        uiLayer.style.display = uiLayer.dataset.previousDisplay || "";
        delete uiLayer.dataset.previousDisplay;
      }
      if (arOverlay) {
        arOverlay.hidden = true;
      }
      if (arBackBtn && arBackButtonHandler) {
        arBackBtn.removeEventListener("click", arBackButtonHandler);
        arBackBtn.disabled = false;
        arBackButtonHandler = null;
      }
      const shouldPopHistory = arStateActive && !arClosingViaHistory;
      activeXRSession = null;
      hitTestSource = null;
      localSpace = null;
      arStateActive = false;
      if (
        shouldPopHistory &&
        window.history.state?.screen === "ar" &&
        window.history.length > 1
      ) {
        window.history.back();
      }
      arClosingViaHistory = false;
      uiApi?.reopenDetails({ replaceHistory: true });
    };

    session.addEventListener("end", handleSessionEnd, { once: true });
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
