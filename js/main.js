import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import {
  onSelect,
  configureWallUtils,
  isWallPlaced,
  setExibicaoAtiva,
  resetWall,
} from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera,
  scene,
  renderer,
  controller,
  reticle,
  arButton,
  arHint,
  arCloseButton;
let hitTestSource = null;
let localSpace = null;
let referenceSpace = null;
let arContainer = null;

function showArHint() {
  if (arHint) {
    arHint.classList.add("visible");
    arHint.setAttribute("aria-hidden", "false");
  }
}

function hideArHint() {
  if (arHint) {
    arHint.classList.remove("visible");
    arHint.setAttribute("aria-hidden", "true");
  }
}

initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada);
  if (arButton) {
    arButton.click();
  }
});

function handleSessionEnd() {
  hitTestSource = null;
  localSpace = null;
  referenceSpace = null;

  if (arContainer) {
    arContainer.style.display = "none";
  }

  if (arCloseButton) {
    arCloseButton.style.display = "none";
    arCloseButton.onclick = null;
  }

  hideArHint();

  const ui = document.getElementById("ui");
  if (ui) {
    ui.style.display = "flex";
  }

  if (reticle) {
    reticle.visible = false;
  }

  if (typeof resetWall === "function") {
    resetWall();
  }

  if (window.__matrioscaBackToCarousel) {
    window.__matrioscaBackToCarousel();
  }
}

(async function init() {
  const sceneObjects = await setupARScene(THREE, ARButton, onSelect);
  camera = sceneObjects.camera;
  scene = sceneObjects.scene;
  renderer = sceneObjects.renderer;
  controller = sceneObjects.controller;
  reticle = sceneObjects.reticle;
  arButton = sceneObjects.arButton;
  arHint = sceneObjects.arHint;
  arCloseButton = sceneObjects.arCloseButton;

  arContainer = renderer.domElement.parentElement;
  if (arContainer) {
    arContainer.style.position = "fixed";
    arContainer.style.inset = "0";
    arContainer.style.zIndex = "1";
    arContainer.style.display = "none";
  }

  const ui = document.getElementById("ui");
  if (ui) {
    ui.style.display = "flex";
    ui.style.position = "relative";
    ui.style.zIndex = "2";
  }

  configureWallUtils({
    THREELib: THREE,
    cameraRef: camera,
    sceneRef: scene,
    reticleRef: reticle,
  });

  renderer.xr.addEventListener("sessionstart", async () => {
    const session = renderer.xr.getSession();
    if (!session) return;

    localSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: localSpace });
    referenceSpace = renderer.xr.getReferenceSpace();

    if (arContainer) {
      arContainer.style.display = "block";
    }

    if (arCloseButton) {
      arCloseButton.style.display = "inline-flex";
      arCloseButton.onclick = () => session.end();
    }

    showArHint();

    session.addEventListener("end", handleSessionEnd, { once: true });
  });

  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame && hitTestSource && referenceSpace) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0 && !isWallPlaced()) {
        const pose = hitTestResults[0].getPose(referenceSpace);
        if (pose) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        }
      } else {
        reticle.visible = false;
      }
    }

    if (isWallPlaced()) {
      hideArHint();
    }

    renderer.render(scene, camera);
  });
})();
