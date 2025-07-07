let THREE, camera, scene, reticle;
let wallPlaced = false;
let exibicaoAtiva = null;

import { getWallTextureFromVideo } from "./video-utils.js";

export function configureWallUtils({ THREELib, cameraRef, sceneRef, reticleRef }) {
  THREE = THREELib;
  camera = cameraRef;
  scene = sceneRef;
  reticle = reticleRef;
}

export function setExibicaoAtiva(exibicao) {
  exibicaoAtiva = exibicao;
}

export function onSelect() {
  if (reticle.visible && !wallPlaced && exibicaoAtiva) {
    const wallTexture = getWallTextureFromVideo(THREE);

    const wall = new THREE.Mesh(
      new THREE.PlaneGeometry(2.5, 1.5),
      new THREE.MeshStandardMaterial({
        map: wallTexture,
        color: wallTexture ? 0xffffff : 0xcccccc,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 1,
      })
    );
    wall.receiveShadow = true;

    const reticlePos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
    const camPos = camera.getWorldPosition(new THREE.Vector3());
    const lookDir = new THREE.Vector3().subVectors(camPos, reticlePos);
    lookDir.y = 0;
    lookDir.normalize();

    wall.position.copy(reticlePos);
    wall.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().lookAt(
        new THREE.Vector3(0, 0, 0),
        lookDir,
        new THREE.Vector3(0, 1, 0)
      )
    );

    scene.add(wall);
    wallPlaced = true;
    reticle.visible = false;

    const group = new THREE.Group();
    wall.add(group);

    const obras = exibicaoAtiva.obras;

    obras.forEach((obra) => {
      addQuadro(group, obra.url, obra.position, obra.size);
      addAutorLabel(scene, group, obra.autor, {
        x: obra.position.x,
        y: obra.position.y - (obra.size?.h || 0.45) / 2 - 0.12,
        z: obra.position.z + 0.021,
      });
    });
  }
}

function addQuadro(group, textureURL, position, size = { w: 0.45, h: 0.45, d: 0.04 }) {
  const loader = new THREE.TextureLoader();
  loader.load(textureURL, (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const canvasMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.FrontSide,
    });

    const whiteFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
    });

    const materials = [
      whiteFrameMaterial,
      whiteFrameMaterial,
      whiteFrameMaterial,
      whiteFrameMaterial,
      canvasMaterial,
      whiteFrameMaterial,
    ];

    const quadroBox = new THREE.Mesh(new THREE.BoxGeometry(size.w, size.h, size.d), materials);
    quadroBox.castShadow = true;
    quadroBox.receiveShadow = true;
    quadroBox.position.set(position.x, position.y, position.z);
    quadroBox.rotation.y = Math.PI;
    group.add(quadroBox);
  });
}

function addAutorLabel(scene, parent, text, offset = { x: 0, y: -0.35, z: 0.01 }) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  ctx.fillStyle = "#fff";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;

  const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const geometry = new THREE.PlaneGeometry(0.9, 0.2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(offset.x, offset.y, offset.z);
  mesh.renderOrder = 999;
  parent.add(mesh);
}

export function isWallPlaced() {
  return wallPlaced;
}
