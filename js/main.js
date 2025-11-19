import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import { onSelect, configureWallUtils, isWallPlaced, setExibicaoAtiva } from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null, localSpace = null;
let pendingARStart = false;

const uiWrapper = document.getElementById("ui");
const cameraOverlay = document.getElementById("camera-overlay");
const cameraBackButton = document.getElementById("camera-back-btn");

const toggleCameraOverlay = (visible) => {
  if (!cameraOverlay) return;
  cameraOverlay.setAttribute("aria-hidden", String(!visible));
  cameraOverlay.classList.toggle("visible", Boolean(visible));
};

const handleSessionEnd = () => {
  uiWrapper.style.display = "";
  toggleCameraOverlay(false);
};

const requestARStart = () => {
  if (arButton) {
    arButton.click();
  } else {
    pendingARStart = true;
  }
};

if (cameraBackButton) {
  cameraBackButton.addEventListener("click", () => {
    const session = renderer?.xr?.getSession();
    if (session) {
      session.end();
    } else {
      handleSessionEnd();
    }
  });
}

initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada);
  requestARStart();
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
    session.addEventListener("end", handleSessionEnd, { once: true });
    localSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: localSpace });

    uiWrapper.style.display = "none";
    toggleCameraOverlay(true);
  });

  renderer.xr.addEventListener("sessionend", handleSessionEnd);

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
  if (pendingARStart && arButton) {
    arButton.click();
    pendingARStart = false;
  }
})();
