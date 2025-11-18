export async function setupARScene(THREE, onSelect) {
  const container = document.createElement("div");
  document.body.appendChild(container);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    20
  );

  const renderer = new THREE.WebGLRenderer({
    antialias: false,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio ?? 1, 1.5));
  renderer.xr.enabled = true;
  renderer.shadowMap.enabled = false;
  container.appendChild(renderer.domElement);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.physicallyCorrectLights = true;
  if (renderer.xr.setFoveation) {
    renderer.xr.setFoveation(0.8);
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
  const reticleMaterial = new THREE.MeshBasicMaterial({
    color: 0x19ff73,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: false,
    toneMapped: false,
  });
  const reticle = new THREE.Group();
  const ringGeometry = new THREE.RingGeometry(0.045, 0.06, 48).rotateX(-Math.PI / 2);
  const innerCircle = new THREE.CircleGeometry(0.01, 24).rotateX(-Math.PI / 2);
  const outerRing = new THREE.Mesh(ringGeometry, reticleMaterial);
  const centerDot = new THREE.Mesh(innerCircle, reticleMaterial.clone());
  outerRing.renderOrder = 999;
  centerDot.renderOrder = 999;
  reticle.add(outerRing);
  reticle.add(centerDot);
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);

  // Controlador XR
  const controller = renderer.xr.getController(0);
  controller.addEventListener("select", onSelect);
  scene.add(controller);

  // Retornar todos os objetos úteis
  return {
    camera,
    scene,
    renderer,
    controller,
    reticle,
  };
}
