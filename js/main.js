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
import { getDeviceXRStatus } from "./device-utils.js";
import { startFallbackExperience } from "./fallback-ar.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null, localSpace = null;

const deviceStatus = getDeviceXRStatus();

const startExperience = (exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada);

  if (deviceStatus.mode === "webxr") {
    if (arButton) {
      arButton.click();
    }
  } else if (deviceStatus.mode === "fallback") {
    startFallbackExperience(exibicaoSelecionada);
  }
};

initUI(startExperience, { deviceStatus });

if (deviceStatus.mode === "webxr") {
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
} else if (deviceStatus.mode === "fallback") {
  console.info(
    "WebXR indisponível. Ativando modo alternativo baseado em câmera para experiência AR."
  );
} else {
  console.warn(
    "Este dispositivo não possui suporte ao WebXR nem ao modo alternativo baseado em câmera."
  );
}
