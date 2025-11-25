import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import { onSelect, configureWallUtils, isWallPlaced, setExibicaoAtiva } from "./wall-utils.js";
import { detectFlatWallPresence } from "./video-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null, localSpace = null;
let wallLatchFrames = 0;

initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada); // envia a exibição para wall-utils
  arButton.click(); // inicia AR
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
  });

  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame && hitTestSource && !isWallPlaced()) {
      const referenceSpace = renderer.xr.getReferenceSpace();
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0) {
        const pose = hitTestResults[0].getPose(referenceSpace);
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
        wallLatchFrames = Math.min(wallLatchFrames + 2, 24);
      } else {
        const flatWall = detectFlatWallPresence();

        if (flatWall.detected || flatWall.surfaceCoverage > 0.68) {
          wallLatchFrames = Math.min(wallLatchFrames + 3, 30);
        } else if (wallLatchFrames > 0) {
          wallLatchFrames -= 1;
        }

        if (wallLatchFrames > 0) {
          // posiciona o retículo a ~1.5m à frente da câmera, usando a rotação atual
          const camPos = new THREE.Vector3();
          const camQuat = new THREE.Quaternion();

          camera.getWorldPosition(camPos);
          camera.getWorldQuaternion(camQuat);

          const offset = new THREE.Vector3(0, 0, -1.5).applyQuaternion(camQuat);
          const reticlePos = camPos.clone().add(offset);

          reticle.visible = true;
          reticle.matrix.compose(reticlePos, camQuat, new THREE.Vector3(1, 1, 1));
        } else {
          reticle.visible = false;
        }
      }
    }

    renderer.render(scene, camera);
  });
})();
