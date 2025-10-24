let THREE, camera, scene, reticle;
let wallPlaced = false;
let exibicaoAtiva = null;

import { getWallTextureFromVideo } from "./video-utils.js";

export function buildExhibitionWall(THREERef, exibicao, options = {}) {
  const {
    wallTexture = null,
    planeSize = { width: 2.5, height: 1.5 },
    includeBackMaterial = true,
  } = options;

  const wallMaterial = new THREERef.MeshStandardMaterial({
    map: wallTexture || null,
    color: wallTexture ? 0xffffff : 0xcccccc,
    roughness: 0.8,
    metalness: 0.1,
    side: includeBackMaterial ? THREERef.DoubleSide : THREERef.FrontSide,
    transparent: !!wallTexture,
    opacity: wallTexture ? 1 : 0.98,
  });

  const wall = new THREERef.Mesh(
    new THREERef.PlaneGeometry(planeSize.width, planeSize.height),
    wallMaterial
  );
  wall.receiveShadow = true;

  const artworksGroup = new THREERef.Group();
  wall.add(artworksGroup);

  exibicao.obras.forEach((obra) => {
    addQuadro(THREERef, artworksGroup, obra);
    addAutorLabel(THREERef, artworksGroup, obra.autor, {
      x: obra.position.x,
      y: obra.position.y - (obra.size?.h || 0.45) / 2 - 0.12,
      z: obra.position.z + 0.021,
    });
  });

  return wall;
}

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
    const wall = buildExhibitionWall(THREE, exibicaoAtiva, { wallTexture });

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
  }
}

function addQuadro(THREERef, group, obra) {
  const { url: textureURL, position, size = { w: 0.45, h: 0.45, d: 0.04 } } = obra;
  const loader = new THREERef.TextureLoader();
  loader.load(textureURL, (texture) => {
    texture.encoding = THREERef.sRGBEncoding;
    texture.anisotropy = 8;
    texture.minFilter = THREERef.LinearMipMapLinearFilter;
    texture.magFilter = THREERef.LinearFilter;
    texture.wrapS = THREERef.ClampToEdgeWrapping;
    texture.wrapT = THREERef.ClampToEdgeWrapping;

    const canvasMaterial = new THREERef.MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
      side: THREERef.FrontSide,
    });

    const whiteFrameMaterial = new THREERef.MeshStandardMaterial({
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

    const quadroBox = new THREERef.Mesh(
      new THREERef.BoxGeometry(size.w, size.h, size.d),
      materials
    );
    quadroBox.castShadow = true;
    quadroBox.receiveShadow = true;
    quadroBox.position.set(position.x, position.y, position.z);
    quadroBox.rotation.y = Math.PI;
    group.add(quadroBox);
  });
}

function addAutorLabel(
  THREERef,
  parent,
  text,
  offset = { x: 0, y: -0.35, z: 0.01 }
) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 512;
  canvas.height = 128;

  ctx.fillStyle = "#fff";
  ctx.font = "28px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 10);

  const texture = new THREERef.CanvasTexture(canvas);
  texture.encoding = THREERef.sRGBEncoding;

  const material = new THREERef.MeshBasicMaterial({ map: texture, transparent: true });
  const geometry = new THREERef.PlaneGeometry(0.9, 0.2);

  const mesh = new THREERef.Mesh(geometry, material);
  mesh.position.set(offset.x, offset.y, offset.z);
  mesh.renderOrder = 999;
  parent.add(mesh);
}

export function isWallPlaced() {
  return wallPlaced;
}
