import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import {
  onSelect,
  configureWallUtils,
  isWallPlaced,
  setExibicaoAtiva,
  updatePreviewWall,
  hidePreviewWall,
  resetWall, // 👈 ADICIONADO AQUI
} from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null;
let localSpace = null;
let referenceSpace = null;
let arContainer = null;

function getPlaneDimensions(plane) {
  if (!plane?.polygon || plane.polygon.length < 3) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;

  plane.polygon.forEach((point) => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minZ = Math.min(minZ, point.z);
    maxZ = Math.max(maxZ, point.z);
  });

  return {
    width: maxX - minX,
    height: maxZ - minZ,
  };
}

// callback que vem da UI (detalhes da exposição -> botão "Iniciar experiência em RA")
initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada); // envia a exibição para o wall-utils
  if (arButton) {
    arButton.click(); // simula clique no botão nativo do WebXR
  }
});

// 🔹 quando sessão AR termina (X do sistema OU qualquer fim de sessão)
function handleSessionEnd() {
  hitTestSource = null;
  localSpace = null;
  referenceSpace = null;

  // esconde o container da RA
  if (arContainer) {
    arContainer.style.display = "none";
  }

  // mostra de volta a UI (mantendo a tela de detalhes/carrossel que já estava ativa)
  const ui = document.getElementById("ui");
  if (ui) {
    ui.style.display = "flex";
  }

  // garante que o retículo some
  if (reticle) {
    reticle.visible = false;
  }

  // 🔥 limpa a parede e quadros da sessão anterior
  if (typeof resetWall === "function") {
    resetWall();
  }

  // se você estiver usando o atalho pra voltar pro carrossel:
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

    session.addEventListener("end", handleSessionEnd, { once: true });
  });

  renderer.setAnimationLoop((timestamp, frame) => {
    let planePreviewed = false;

    if (frame && referenceSpace && !isWallPlaced()) {
      const planes = frame.detectedPlanes;

      if (planes && planes.size > 0) {
        for (const plane of planes) {
          if (plane.orientation !== "vertical") continue;

          const pose = frame.getPose(plane.planeSpace, referenceSpace);
          if (!pose) continue;

          const bounds = getPlaneDimensions(plane);
          const targetSize = bounds
            ? {
                w: Math.max(1, Math.min(2.8, bounds.width * 0.9)),
                h: Math.max(0.8, Math.min(1.8, bounds.height * 0.9)),
              }
            : undefined;

          updatePreviewWall(pose.transform.matrix, targetSize);
          planePreviewed = true;
          break;
        }
      }
    }

    if (planePreviewed) {
      reticle.visible = false;
    } else if (frame && hitTestSource && referenceSpace) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);

      if (hitTestResults.length > 0 && !isWallPlaced()) {
        const pose = hitTestResults[0].getPose(referenceSpace);
        if (pose) {
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        }
      } else {
        reticle.visible = false;
        hidePreviewWall();
      }
    } else {
      hidePreviewWall();
      reticle.visible = false;
    }

    renderer.render(scene, camera);
  });
})();
