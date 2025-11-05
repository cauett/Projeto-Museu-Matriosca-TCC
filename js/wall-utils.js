// wall utils (moldura preta = CAIXA fechada + porta-retrato fino + espaçamento automático + fotografia refinada)
let THREE, camera, scene, reticle;
let wallPlaced = false;
let exibicaoAtiva = null;

import { getWallTextureFromVideo } from "./video-utils.js";

export function configureWallUtils({
  THREELib,
  cameraRef,
  sceneRef,
  reticleRef,
}) {
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
      }),
    );
    wall.receiveShadow = true;

    // posiciona a parede virada para a câmera
    const reticlePos = new THREE.Vector3().setFromMatrixPosition(
      reticle.matrix,
    );
    const camPos = camera.getWorldPosition(new THREE.Vector3());
    const lookDir = new THREE.Vector3().subVectors(camPos, reticlePos);
    lookDir.y = 0;
    lookDir.normalize();

    wall.position.copy(reticlePos);
    wall.quaternion.setFromRotationMatrix(
      new THREE.Matrix4().lookAt(
        new THREE.Vector3(0, 0, 0),
        lookDir,
        new THREE.Vector3(0, 1, 0),
      ),
    );

    scene.add(wall);
    wallPlaced = true;
    reticle.visible = false;

    const group = new THREE.Group();
    wall.add(group);

    const quadroTipo = exibicaoAtiva.quadroTipo ?? "moldura";
    const obras = exibicaoAtiva.obras;

    obras.forEach((obra, idx) => {
      // leve nudge em Z para evitar z-fighting visual entre quadros
      const zNudge = (idx % 3) * 0.0006; // 0, 0.0006, 0.0012
      const pos = { ...obra.position, z: (obra.position?.z ?? 0) + zNudge };

      addQuadro(group, obra.url, pos, obra.size, quadroTipo);

      const labelZOffset =
        quadroTipo === "fotografia" ? pos.z + 0.012 : pos.z + 0.021;
      addAutorLabel(scene, group, obra.autor, {
        x: pos.x,
        y: pos.y - (obra.size?.h || 0.45) / 2 - 0.12,
        z: labelZOffset,
      });
    });

    // distribuição automática por linha para garantir respiro
    spreadByRows(group, {
      minGapX: "auto", // calcula gap proporcional à largura média da linha
      rowSnap: 0.08, // tolerância para agrupar por linha (eixo Y)
      edgePadding: 0.03, // folga nas extremidades da linha
    });
  }
}

/** Agrupa quadros por linha (Y aproximado) e garante gap mínimo entre larguras externas. */
function spreadByRows(
  parentGroup,
  { minGapX = "auto", rowSnap = 0.08, edgePadding = 0.03 } = {},
) {
  const frames = parentGroup.children.filter(
    (c) => c.userData?.kind === "quadro",
  );
  const rowsMap = new Map();

  for (const f of frames) {
    const key = Math.round(f.position.y / rowSnap) * rowSnap;
    if (!rowsMap.has(key)) rowsMap.set(key, []);
    rowsMap.get(key).push(f);
  }

  for (const [, row] of rowsMap) {
    row.sort((a, b) => a.position.x - b.position.x);

    // gap auto: 25–35% da largura média das molduras da linha (c/ travas)
    let gap = 0.12;
    if (minGapX === "auto") {
      const widths = row.map((n) => n.userData?.outerW ?? 0.25);
      const avgW =
        widths.reduce((s, w) => s + w, 0) / Math.max(widths.length, 1);
      gap = Math.max(0.06, Math.min(0.35 * avgW, 0.14));
    } else if (typeof minGapX === "number") {
      gap = minGapX;
    }

    const widths = row.map((n) => n.userData?.outerW ?? 0.25);

    // empurra da esquerda para a direita garantindo gap
    for (let i = 1; i < row.length; i++) {
      const left = row[i - 1];
      const right = row[i];
      const wL = widths[i - 1];
      const wR = widths[i];

      const leftEdge = left.position.x + wL / 2;
      const rightEdge = right.position.x - wR / 2;
      const currentGap = rightEdge - leftEdge;

      if (currentGap < gap) {
        right.position.x += gap - currentGap;
      }
    }

    // folga nas pontas da linha
    if (row.length >= 2) {
      row[0].position.x -= edgePadding;
      row[row.length - 1].position.x += edgePadding;
    }

    // micro separação no Z por ordem (reforça leitura individual)
    row.forEach((f, i) => {
      f.position.z += i * 0.0003;
    });
  }
}

function addQuadro(
  group,
  textureURL,
  position,
  size = { w: 0.45, h: 0.45, d: 0.04 },
  quadroTipo = "moldura",
) {
  const loader = new THREE.TextureLoader();
  loader.load(textureURL, (texture) => {
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = 8;
    texture.minFilter = THREE.LinearMipMapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    // helpers anti z-fighting
    const POLY_OFFSET = {
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    };

    // ===== TIPO FOTOGRAFIA — papel com janela (anel extrudado) e foto recuada =====
    if (quadroTipo === "fotografia") {
      const photoGroup = new THREE.Group();
      photoGroup.userData = { kind: "quadro" };
      photoGroup.position.set(position.x, position.y, position.z);
      photoGroup.rotation.y = Math.PI;

      // parâmetros visuais finos/realistas
      const paperBorder = 0.012; // borda visível ao redor da foto (~1.2 cm)
      const paperThick = 0.0042; // espessura do papel
      const photoRecess = 0.001; // recuo da foto atrás da face frontal
      const cornerRadius = Math.min(size.w, size.h) * 0.06;

      // dimensões
      const paperW = size.w + paperBorder * 2;
      const paperH = size.h + paperBorder * 2;

      // materiais
      const paperMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf8f6ee, // branco “quente”
        roughness: 0.55,
        metalness: 0.0,
        clearcoat: 0.25,
        clearcoatRoughness: 0.6,
      });
      const photoMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.0,
        clearcoat: 0.12,
        clearcoatRoughness: 0.5,
        ...POLY_OFFSET,
      });
      const tapeMaterial = new THREE.MeshStandardMaterial({
        color: 0xdcc8a0,
        roughness: 0.8,
        metalness: 0.0,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      });

      // shape utilitário com cantos arredondados
      function roundedRectShape(w, h, r) {
        const s = new THREE.Shape();
        const hw = w / 2,
          hh = h / 2;
        const rr = Math.min(r, hw, hh);
        s.moveTo(-hw + rr, -hh);
        s.lineTo(hw - rr, -hh);
        s.quadraticCurveTo(hw, -hh, hw, -hh + rr);
        s.lineTo(hw, hh - rr);
        s.quadraticCurveTo(hw, hh, hw - rr, hh);
        s.lineTo(-hw + rr, hh);
        s.quadraticCurveTo(-hw, hh, -hw, hh - rr);
        s.lineTo(-hw, -hh + rr);
        s.quadraticCurveTo(-hw, -hh, -hw + rr, -hh);
        return s;
      }

      // 1) PAPEL como ANEL EXTRUDADO (recorte central = janela)
      const outerShape = roundedRectShape(paperW, paperH, cornerRadius);
      const innerShape = roundedRectShape(
        size.w,
        size.h,
        Math.max(0, cornerRadius - paperBorder),
      );
      outerShape.holes.push(innerShape);

      const paperGeo = new THREE.ExtrudeGeometry(outerShape, {
        depth: paperThick,
        bevelEnabled: false,
      });
      // centraliza no Z: frente em +paperThick/2
      paperGeo.translate(0, 0, -paperThick / 2);

      const paperMesh = new THREE.Mesh(paperGeo, paperMaterial);
      paperMesh.castShadow = true;
      paperMesh.receiveShadow = true;
      photoGroup.add(paperMesh);

      // 2) FOTO (atrás da janela, recuada)
      const photoGeo = new THREE.PlaneGeometry(size.w, size.h);
      const photoMesh = new THREE.Mesh(photoGeo, photoMaterial);
      // a face frontal do papel está em +paperThick/2; foto fica um pouco atrás
      photoMesh.position.set(0, 0, paperThick / 2 - photoRecess);
      photoMesh.renderOrder = 1;
      photoGroup.add(photoMesh);

      // 3) FITAS discretas nos cantos superiores
      const tapeW = Math.min(size.w, size.h) * 0.24;
      const tapeH = tapeW * 0.18;
      function addTape(px, py, rot) {
        const g = new THREE.PlaneGeometry(tapeW, tapeH);
        const m = new THREE.Mesh(g, tapeMaterial);
        m.position.set(px, py, paperThick / 2 + 0.0006);
        m.rotation.z = rot;
        photoGroup.add(m);
      }
      const offX = paperW / 2 - tapeW * 0.42;
      const offY = paperH / 2 - tapeH * 0.55;
      addTape(+offX, +offY, Math.PI * 0.06);
      addTape(-offX, +offY, -Math.PI * 0.06);

      // largura externa para cálculo de gap
      photoGroup.userData.outerW = paperW;

      group.add(photoGroup);
      return;
    }

    // ===== TIPO MOLDURA PRETA — caixa fechada com janela =====
    if (quadroTipo === "molduraPreta") {
      const frameGroup = new THREE.Group();
      frameGroup.userData = { kind: "quadro" };
      frameGroup.position.set(position.x, position.y, position.z);
      frameGroup.rotation.y = Math.PI;

      // dimensões da “caixa”
      const frameThickness = 0.018; // barras finas
      const frameDepth = Math.max(size.d ?? 0.028, 0.028) + 0.012;
      const matOverlap = 0.012; // pouca cobertura

      const outerW = size.w + frameThickness * 2;
      const outerH = size.h + frameThickness * 2;
      const innerW = Math.max(size.w - matOverlap * 2, 0.01);
      const innerH = Math.max(size.h - matOverlap * 2, 0.01);

      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.45,
        metalness: 0.25,
      });
      const matteMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0.9,
        metalness: 0.02,
        side: THREE.DoubleSide,
        ...POLY_OFFSET,
      });
      const artworkMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        roughness: 0.65,
        metalness: 0.0,
        side: THREE.FrontSide,
        ...POLY_OFFSET,
      });

      // 1) anel extrudado (moldura)
      const ringShape = new THREE.Shape();
      ringShape.moveTo(-outerW / 2, -outerH / 2);
      ringShape.lineTo(outerW / 2, -outerH / 2);
      ringShape.lineTo(outerW / 2, outerH / 2);
      ringShape.lineTo(-outerW / 2, outerH / 2);
      ringShape.lineTo(-outerW / 2, -outerH / 2);

      const hole = new THREE.Path();
      hole.moveTo(-innerW / 2, -innerH / 2);
      hole.lineTo(innerW / 2, -innerH / 2);
      hole.lineTo(innerW / 2, innerH / 2);
      hole.lineTo(-innerW / 2, innerH / 2);
      hole.lineTo(-innerW / 2, -innerH / 2);
      ringShape.holes.push(hole);

      const ringGeo = new THREE.ExtrudeGeometry(ringShape, {
        depth: frameDepth,
        bevelEnabled: false,
      });
      ringGeo.translate(0, 0, -frameDepth / 2);

      const frameRing = new THREE.Mesh(ringGeo, frameMaterial);
      frameRing.castShadow = true;
      frameRing.receiveShadow = true;
      frameGroup.add(frameRing);

      // 2) tampa traseira (fecha por trás)
      const backCover = new THREE.Mesh(
        new THREE.PlaneGeometry(innerW, innerH),
        matteMaterial,
      );
      backCover.position.set(0, 0, -frameDepth / 2 + 0.0006);
      backCover.receiveShadow = true;
      frameGroup.add(backCover);

      // 3) arte recuada
      const recess = 0.003;
      const artZ = frameDepth / 2 - recess;
      const artwork = new THREE.Mesh(
        new THREE.PlaneGeometry(size.w, size.h),
        artworkMaterial,
      );
      artwork.position.set(0, 0, artZ);
      artwork.castShadow = false;
      artwork.receiveShadow = false;
      frameGroup.add(artwork);

      // 4) “vidro” discreto
      const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.04,
        roughness: 0.1,
        metalness: 0.0,
        transmission: 0.0,
        side: THREE.FrontSide,
      });
      const glass = new THREE.Mesh(
        new THREE.PlaneGeometry(innerW, innerH),
        glassMaterial,
      );
      glass.position.set(0, 0, frameDepth / 2 - 0.0005);
      glass.renderOrder = 2;
      frameGroup.add(glass);

      frameGroup.castShadow = true;
      frameGroup.receiveShadow = true;

      frameGroup.userData.outerW = outerW;
      group.add(frameGroup);
      return;
    }

    // ===== TIPO “moldura” branca (canvas) =====
    const canvasMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
      side: THREE.FrontSide,
      ...POLY_OFFSET,
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

    const quadroBox = new THREE.Mesh(
      new THREE.BoxGeometry(size.w, size.h, size.d),
      materials,
    );
    quadroBox.userData = { kind: "quadro", outerW: size.w };
    quadroBox.castShadow = true;
    quadroBox.receiveShadow = true;
    quadroBox.position.set(position.x, position.y, position.z);
    quadroBox.rotation.y = Math.PI;
    group.add(quadroBox);
  });
}

function addAutorLabel(
  scene,
  parent,
  text,
  offset = { x: 0, y: -0.35, z: 0.01 },
) {
  if (!text) return;

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

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });
  const geometry = new THREE.PlaneGeometry(0.9, 0.2);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(offset.x, offset.y, offset.z);
  mesh.renderOrder = 999;
  parent.add(mesh);
}

export function isWallPlaced() {
  return wallPlaced;
}
