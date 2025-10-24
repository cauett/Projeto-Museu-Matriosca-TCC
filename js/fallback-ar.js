import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { DeviceOrientationControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/DeviceOrientationControls.js";

import {
  initVideoStream,
  showVideoBackground,
  hideVideoBackground,
  stopVideoStream,
  getWallTextureFromVideo,
  video,
} from "./video-utils.js";
import { buildExhibitionWall } from "./wall-utils.js";

let renderer;
let scene;
let camera;
let controls;
let animationFrame = null;
let wallMesh = null;
let container;
let exitButton;
let instructionsWrapper;
let permissionInfo;
let cameraInfo;
let orientationPermissionGranted = null;

async function ensureOrientationPermission() {
  if (orientationPermissionGranted !== null) {
    return orientationPermissionGranted;
  }

  if (
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function"
  ) {
    try {
      const response = await DeviceOrientationEvent.requestPermission();
      orientationPermissionGranted = response === "granted";
    } catch (err) {
      console.warn("Permissão de orientação não concedida:", err);
      orientationPermissionGranted = false;
    }
  } else {
    orientationPermissionGranted = true;
  }

  return orientationPermissionGranted;
}

function handleResize() {
  if (!renderer || !camera) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function setupOverlay() {
  if (container) {
    return;
  }

  container = document.createElement("div");
  container.id = "fallback-container";
  container.style.display = "none";
  document.body.appendChild(container);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.domElement.classList.add("fallback-canvas");
  container.appendChild(renderer.domElement);

  const uiWrapper = document.createElement("div");
  uiWrapper.id = "fallback-ui";
  container.appendChild(uiWrapper);

  exitButton = document.createElement("button");
  exitButton.id = "fallback-exit-btn";
  exitButton.type = "button";
  exitButton.textContent = "Sair do modo alternativo";
  exitButton.addEventListener("click", stopFallbackExperience);
  uiWrapper.appendChild(exitButton);

  instructionsWrapper = document.createElement("div");
  instructionsWrapper.id = "fallback-instructions";
  instructionsWrapper.innerHTML =
    "<p>Mova o aparelho para explorar a parede virtual posicionada à sua frente.</p><p class=\"fallback-tip\">Use o botão acima para voltar à galeria.</p>";
  permissionInfo = document.createElement("p");
  permissionInfo.className = "fallback-permission";
  instructionsWrapper.appendChild(permissionInfo);
  cameraInfo = document.createElement("p");
  cameraInfo.className = "fallback-camera-warning";
  instructionsWrapper.appendChild(cameraInfo);
  uiWrapper.appendChild(instructionsWrapper);
}

function setupScene() {
  if (scene) {
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    100
  );
  camera.position.set(0, 1.4, 0);

  controls = new DeviceOrientationControls(camera);
  controls.connect();

  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x404040, 1.1);
  scene.add(hemiLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
  dirLight.position.set(2.5, 4, 1.5);
  scene.add(dirLight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambient);

  window.addEventListener("resize", handleResize);
}

function renderLoop() {
  if (!renderer || !scene || !camera) return;

  controls?.update();
  renderer.render(scene, camera);
  animationFrame = window.requestAnimationFrame(renderLoop);
}

function addOrUpdateWall(exibicao) {
  if (!scene) return;

  if (wallMesh) {
    scene.remove(wallMesh);
    wallMesh = null;
  }

  const wallTexture = getWallTextureFromVideo(THREE);
  wallMesh = buildExhibitionWall(THREE, exibicao, {
    wallTexture,
    includeBackMaterial: false,
  });
  wallMesh.position.set(0, 1.35, -2.2);
  wallMesh.rotation.y = Math.PI;
  scene.add(wallMesh);
}

function resetRendererState() {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
  }

  if (wallMesh && scene) {
    scene.remove(wallMesh);
    wallMesh = null;
  }
}

export async function startFallbackExperience(exibicao) {
  setupOverlay();
  setupScene();

  const permissionGranted = await ensureOrientationPermission();
  if (permissionInfo) {
    permissionInfo.textContent = permissionGranted
      ? ""
      : "Não foi possível acessar o giroscópio. A orientação da cena ficará fixa.";
  }

  if (controls) {
    controls.enabled = permissionGranted;
  }

  await initVideoStream();
  const cameraAvailable = !!(video && video.readyState >= 2 && video.srcObject);
  if (cameraInfo) {
    cameraInfo.textContent = cameraAvailable
      ? ""
      : "Não foi possível acessar a câmera. Exibindo ambiente virtual simplificado.";
  }

  if (cameraAvailable) {
    showVideoBackground();
  } else {
    hideVideoBackground();
  }

  addOrUpdateWall(exibicao);

  if (container) {
    container.style.display = "block";
  }
  const ui = document.getElementById("ui");
  if (ui) {
    ui.style.display = "none";
  }
  document.body.classList.add("fallback-active");

  renderLoop();
}

export function stopFallbackExperience() {
  resetRendererState();
  hideVideoBackground();
  stopVideoStream();

  if (container) {
    container.style.display = "none";
  }

  const ui = document.getElementById("ui");
  if (ui) {
    ui.style.display = "";
  }

  document.body.classList.remove("fallback-active");
}
