import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { ARButton } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/webxr/ARButton.js";
import { setupARScene } from "./ar-setup.js";
import {
  onSelect,
  configureWallUtils,
  isWallPlaced,
  setExibicaoAtiva,
  resetWallPlacement,
} from "./wall-utils.js";
import { initVideoStream } from "./video-utils.js";
import { initUI } from "./ui.js";

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null, localSpace = null;
let xrSession = null;
let webxrSupported = false;
let arSceneReady = false;
let videoRequested = false;

const startArBtn = document.getElementById("start-ar-btn");
const arStatusMessage = document.getElementById("ar-status-message");
const arOverlay = document.getElementById("ar-overlay");
const arOverlayStatus = document.getElementById("ar-overlay-status");
const exitArBtn = document.getElementById("exit-ar-btn");

setStartButtonEnabled(false);
setArStatus(
  "Verificando compatibilidade do dispositivo com realidade aumentada...",
  "warning",
);
detectWebXRSupport();

if (exitArBtn) {
  exitArBtn.addEventListener("click", () => endCurrentSession());
}

window.addEventListener("video-stream-error", () => {
  setArStatus(
    "Não foi possível acessar a câmera. Autorize o uso ou tente outro navegador.",
    "error",
  );
});

window.addEventListener("video-stream-ready", () => {
  if (webxrSupported) {
    setArStatus(
      "Toque no botão e, após abrir a câmera, aponte para uma parede iluminada.",
    );
  }
});

initUI((exibicaoSelecionada) => {
  setExibicaoAtiva(exibicaoSelecionada); // envia a exibição para wall-utils
  if (!webxrSupported) {
    setArStatus(
      "Este navegador não oferece suporte ao WebXR. No iOS use um app compatível com RA.",
      "error",
    );
    return;
  }

  if (!arSceneReady || !arButton) {
    setArStatus("Carregando recursos de RA...", "warning");
    return;
  }

  startArBtn?.setAttribute("aria-busy", "true");
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
  arSceneReady = true;

  configureWallUtils({
    THREELib: THREE,
    cameraRef: camera,
    sceneRef: scene,
    reticleRef: reticle,
  });

  renderer.xr.addEventListener("sessionstart", async () => {
    xrSession = renderer.xr.getSession();
    try {
      localSpace = await xrSession.requestReferenceSpace("viewer");
      hitTestSource = await xrSession.requestHitTestSource({ space: localSpace });
    } catch (error) {
      console.error("Não foi possível iniciar o hit test:", error);
    }

    await ensureVideoStream();
    sessionBecameActive();
  });

  renderer.xr.addEventListener("sessionend", () => {
    xrSession = null;
    if (hitTestSource?.cancel) {
      hitTestSource.cancel();
    }
    hitTestSource = null;
    localSpace = null;
    resetWallPlacement();
    sessionBecameInactive();
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

    updateOverlayCopy();
    renderer.render(scene, camera);
  });

  window.addEventListener("resize", onWindowResize);
  onWindowResize();
})();

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function sessionBecameActive() {
  document.body.classList.add("ar-active");
  toggleOverlay(true);
  setStartButtonEnabled(false);
  setArStatus("Aponte para uma parede iluminada e toque para posicionar.");
}

function sessionBecameInactive() {
  document.body.classList.remove("ar-active");
  toggleOverlay(false);
  setStartButtonEnabled(webxrSupported);
  startArBtn?.removeAttribute("aria-busy");
  setArStatus(
    webxrSupported
      ? "Experiência finalizada. Escolha outra exposição para visitar."
      : "Este dispositivo não suporta RA.",
  );
}

function toggleOverlay(show, text) {
  if (!arOverlay) return;
  if (!show) {
    arOverlay.setAttribute("hidden", "true");
    return;
  }
  arOverlay.removeAttribute("hidden");
  if (text && arOverlayStatus) {
    arOverlayStatus.textContent = text;
  }
}

function updateOverlayCopy() {
  if (!arOverlay || arOverlay.hasAttribute("hidden") || !arOverlayStatus) return;
  let text = "Aponte para uma parede e mova o aparelho lentamente.";
  if (isWallPlaced()) {
    text = "Obra posicionada. Use 'Sair da RA' para voltar ao museu.";
  } else if (reticle && reticle.visible) {
    text = "Toque para posicionar a parede virtual.";
  }
  if (arOverlayStatus.textContent !== text) {
    arOverlayStatus.textContent = text;
  }
}

function endCurrentSession() {
  const session = renderer?.xr?.getSession?.();
  if (session) {
    session.end();
  }
}

async function ensureVideoStream() {
  if (videoRequested) return;
  videoRequested = true;
  const ok = await initVideoStream();
  if (!ok) {
    videoRequested = false;
  }
}

async function detectWebXRSupport() {
  if (!navigator?.xr?.isSessionSupported) {
    setArStatus(
      "Seu navegador não suporta WebXR. No iOS utilize um navegador compatível com RA (como o WebXR Viewer).",
      "error",
    );
    return;
  }

  try {
    webxrSupported = await navigator.xr.isSessionSupported("immersive-ar");
    setStartButtonEnabled(webxrSupported);
    setArStatus(
      webxrSupported
        ? "Escolha uma exposição e toque para iniciar a realidade aumentada."
        : "WebXR não está disponível neste dispositivo. Experimente outro navegador.",
      webxrSupported ? "" : "error",
    );
  } catch (error) {
    console.error("Falha ao verificar suporte ao WebXR", error);
    setArStatus(
      "Não foi possível verificar o suporte a RA neste dispositivo.",
      "warning",
    );
  }
}

function setArStatus(message, variant = "") {
  if (!arStatusMessage) return;
  arStatusMessage.textContent = message;
  arStatusMessage.classList.remove("warning", "error");
  if (variant) {
    arStatusMessage.classList.add(variant);
  }
}

function setStartButtonEnabled(enabled) {
  if (!startArBtn) return;
  startArBtn.disabled = !enabled;
}
