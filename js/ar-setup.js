import { initVideoStream } from "./video-utils.js";

export async function setupARScene(THREE, ARButton, onSelect) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.xr.enabled = true;
  container.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;


  // Criar e esconder o ARButton para acionamento no novo botão
  const arElement = ARButton.createButton(renderer, {
    requiredFeatures: ["hit-test"],
  });
  let arButton = null;

  if (arElement.tagName === "BUTTON") {
    arElement.style.display = "none";
    arElement.setAttribute("aria-hidden", "true");
    document.body.appendChild(arElement);
    arButton = arElement;
  }

  // Iluminação
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(1, 3, 2);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const spotLight = new THREE.SpotLight(0xffffff, 2);
  spotLight.position.set(0, 2.5, 1.5);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // Retículo
  const ringGeometry = new THREE.RingGeometry(0.05, 0.06, 32).rotateX(-Math.PI / 2);
  const reticle = new THREE.Mesh(
    ringGeometry,
    new THREE.MeshBasicMaterial({ color: 0x00ff00 })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Controlador XR
  const controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  // Iniciar vídeo para capturar textura
  await initVideoStream();

  // Retornar todos os objetos úteis
  return {
    camera,
    scene,
    renderer,
    controller,
    reticle,
    arButton,
  };
}
