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

const uiElement = document.getElementById("ui");

let camera,
  scene,
  renderer,
  controller,
  reticle,
  arButton,
  arHint,
  arCloseButton,
  arContainer,
  hitTestSource,
  localSpace,
  referenceSpace;

const toggleHintVisibility = (shouldShow) => {
  if (!arHint) return;
  arHint.classList.toggle("visible", shouldShow);
  arHint.setAttribute("aria-hidden", shouldShow ? "false" : "true");
};

const toggleUIVisibility = (shouldShow) => {
  if (uiElement) uiElement.style.display = shouldShow ? "flex" : "none";
};

const toggleArContainer = (shouldShow) => {
  if (arContainer) arContainer.style.display = shouldShow ? "block" : "none";
  if (!arCloseButton) return;
  arCloseButton.style.display = shouldShow ? "inline-flex" : "none";
  arCloseButton.onclick = shouldShow
    ? () => renderer.xr.getSession()?.end()
    : null;
};

initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada);
  arButton?.click();
});

const handleSessionEnd = () => {
  hitTestSource = null;
  localSpace = null;
  referenceSpace = null;

  toggleArContainer(false);
  toggleHintVisibility(false);
  toggleUIVisibility(true);

  if (reticle) reticle.visible = false;
  resetWall?.();
  window.__matrioscaBackToCarousel?.();
};

(async function init() {
  const sceneObjects = await setupARScene(THREE, ARButton, onSelect);
  ({
    camera,
    scene,
    renderer,
    controller,
    reticle,
    arButton,
    arHint,
    arCloseButton,
  } = sceneObjects);

  arContainer = renderer.domElement.parentElement;
  if (arContainer) {
    Object.assign(arContainer.style, {
      position: "fixed",
      inset: "0",
      zIndex: "1",
      display: "none",
    });
  }

  if (uiElement) {
    Object.assign(uiElement.style, {
      display: "flex",
      position: "relative",
      zIndex: "2",
    });
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

    toggleArContainer(true);
    toggleHintVisibility(true);

    session.addEventListener("end", handleSessionEnd, { once: true });
  });

  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame && hitTestSource && referenceSpace) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      const pose = hitTestResults[0]?.getPose(referenceSpace);

      if (pose && !isWallPlaced()) {
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }

    if (isWallPlaced()) toggleHintVisibility(false);
    renderer.render(scene, camera);
  });
})();
