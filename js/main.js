import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import {
  onSelect,
  configureWallUtils,
  isWallPlaced,
  setExibicaoAtiva,
  resetWall, // 👈 ADICIONADO AQUI
} from "./wall-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null;
let localSpace = null;
let referenceSpace = null;
let arContainer = null;

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

    renderer.render(scene, camera);
  });
})();
