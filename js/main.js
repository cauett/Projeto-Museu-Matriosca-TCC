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

let camera, scene, renderer, controller, reticle, arButton;
let hitTestSource = null,
  localSpace = null;
let wallOverlays = new Map();
let reticleGridMaterial = null;
let largestWall = null;

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

    // tenta elevar o frame rate quando suportado
    try {
      session.updateTargetFrameRate?.(72);
    } catch (_) {
      // silencioso: alguns navegadores não implementam
    }

    document.getElementById("ui").style.display = "none";
  });

  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) updateWallDetection(frame);

    renderer.render(scene, camera);
  });
})();

function isVerticalPlane(matrix) {
  // normal é coluna Z da matriz 4x4 (índices 8,9,10)
  const normal = new THREE.Vector3(matrix[8], matrix[9], matrix[10]).normalize();
  return Math.abs(normal.y) < 0.45; // quase vertical
}

function polygonArea(polygon) {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    area += polygon[i].x * polygon[j].y - polygon[j].x * polygon[i].y;
  }
  return Math.abs(area) / 2;
}

function buildGeometryFromPolygon(polygon) {
  const shape = new THREE.Shape(polygon);
  const triangles = THREE.ShapeUtils.triangulateShape(polygon, []);
  const geometry = new THREE.BufferGeometry();
  const vertices = [];

  triangles.forEach(([a, b, c]) => {
    const pa = polygon[a];
    const pb = polygon[b];
    const pc = polygon[c];
    vertices.push(pa.x, 0, pa.y, pb.x, 0, pb.y, pc.x, 0, pc.y);
  });

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  return geometry;
}

function buildReticleGrid(shape, bbox) {
  if (!reticleGridMaterial) {
    reticleGridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff6a,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
  }

  const gridGroup = new THREE.Group();
  const ringGeometry = new THREE.RingGeometry(0.035, 0.05, 28).rotateX(-Math.PI / 2);
  const spacing = 0.32;

  for (let x = bbox.min.x; x <= bbox.max.x; x += spacing) {
    for (let y = bbox.min.y; y <= bbox.max.y; y += spacing) {
      const point = new THREE.Vector2(x, y);
      if (!shape.containsPoint(point)) continue;

      const ring = new THREE.Mesh(ringGeometry, reticleGridMaterial);
      ring.position.set(point.x, 0.001, point.y);
      gridGroup.add(ring);
    }
  }

  return gridGroup;
}

function upsertWallOverlay(plane, poseMatrix) {
  const polygon2d = plane.polygon.map((p) =>
    new THREE.Vector2(p.x, p.z ?? p.y ?? 0),
  );
  if (polygon2d.length < 3) return null;

  const area = polygonArea(polygon2d);
  if (area < 0.2) return null; // ignora planos muito pequenos

  const geometry = buildGeometryFromPolygon(polygon2d);
  const bbox = new THREE.Box2().setFromPoints(polygon2d);
  const shape = new THREE.Shape(polygon2d);

  let overlay = wallOverlays.get(plane);
  if (!overlay) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xff3d3d,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.renderOrder = 10;

    const grid = buildReticleGrid(shape, bbox);
    grid.matrixAutoUpdate = false;
    grid.renderOrder = 11;

    overlay = { mesh, grid };
    wallOverlays.set(plane, overlay);
    scene.add(mesh);
    scene.add(grid);
  } else {
    overlay.mesh.geometry.dispose();
    overlay.mesh.geometry = geometry;

    overlay.grid.children.forEach((child) => child.geometry?.dispose?.());
    overlay.grid.clear();
    const grid = buildReticleGrid(shape, bbox);
    overlay.grid.add(...grid.children);
  }

  overlay.mesh.matrix.fromArray(poseMatrix);
  overlay.grid.matrix.fromArray(poseMatrix);
  overlay.area = area;

  return overlay;
}

function cleanupMissingPlanes(currentPlanes) {
  for (const [plane, overlay] of wallOverlays.entries()) {
    if (!currentPlanes.has(plane)) {
      scene.remove(overlay.mesh);
      scene.remove(overlay.grid);
      overlay.mesh.geometry?.dispose();
      overlay.mesh.material?.dispose();
      wallOverlays.delete(plane);
    }
  }
}

function updateWallDetection(frame) {
  const referenceSpace = renderer.xr.getReferenceSpace();
  const detectedPlanes = frame.worldInformation?.detectedPlanes;

  if (!detectedPlanes) {
    reticle.visible = false;
    return;
  }

  const currentPlanes = new Set();
  let largest = null;

  for (const plane of detectedPlanes) {
    const pose = frame.getPose(plane.planeSpace, referenceSpace);
    if (!pose) continue;

    const matrix = pose.transform.matrix;
    if (!isVerticalPlane(matrix)) continue;

    const overlay = upsertWallOverlay(plane, matrix);
    if (!overlay) continue;

    currentPlanes.add(plane);
    if (!largest || overlay.area > largest.area) largest = overlay;
  }

  cleanupMissingPlanes(currentPlanes);

  largestWall = largest;

  if (!isWallPlaced() && largestWall) {
    reticle.visible = true;
    reticle.matrix.fromArray(largestWall.mesh.matrix.elements);
  } else {
    reticle.visible = false;
  }

  const overlaysVisible = !isWallPlaced();
  wallOverlays.forEach(({ mesh, grid }) => {
    mesh.visible = overlaysVisible;
    grid.visible = overlaysVisible;
  });
}
