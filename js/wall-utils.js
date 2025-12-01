// wall utils (moldura preta = CAIXA fechada + porta-retrato fino + espaçamento automático + fotografia refinada)
let THREE, camera, scene, reticle;
let wallPlaced = false;
let exibicaoAtiva = null;
let currentWall = null; // parede atual da sessão
let previewGroup = null;
let sharedLoader = null;
const textureCache = new Map();

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
  preloadTexturesForExibicao();
}

export function setExibicaoAtiva(exibicao) {
  exibicaoAtiva = exibicao;
  preloadTexturesForExibicao();
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
    currentWall = wall; // guarda referência da parede atual
    wallPlaced = true;
    reticle.visible = false;
    removePreview();

    const group = new THREE.Group();
    wall.add(group);

    const quadroTipo = exibicaoAtiva.quadroTipo ?? "moldura";
    const obras = exibicaoAtiva.obras;

    obras.forEach((obra, idx) => {
      // micro nudge em Z para evitar z-fighting
      const zNudge = (idx % 3) * 0.0006; // 0, 0.0006, 0.0012
      const pos = { ...obra.position, z: (obra.position?.z ?? 0) + zNudge };

      addQuadro(group, obra.url, pos, obra.size, quadroTipo);

      // label do autor, com deslocamento proporcional ao tamanho do quadro
      const h = obra.size?.h || 0.36;
      const labelZOffset =
        quadroTipo === "fotografia" ? pos.z + 0.012 : pos.z + 0.021;
      addAutorLabel(scene, group, obra.autor, {
        x: pos.x,
        y: pos.y - h / 2 - 0.12,
        z: labelZOffset,
      });
    });

    // distribuição automática: centrada e com gap uniforme
    if (exibicaoAtiva.autoSpread !== false) {
      spreadByRows(group, {
        minGapX: "auto", // gap calculado a partir da largura média
        rowSnap: 0.08, // tolerância de agrupamento por Y
      });
    }
  }
}

function computeOuterWidth(size, quadroTipo) {
  const nSize = normalizeSize(size, quadroTipo);

  if (quadroTipo === "fotografia") {
    const paperBorder = 0.01;
    return nSize.w + paperBorder * 2;
  }

  const frameThickness = 0.018;
  if (quadroTipo === "molduraPreta" || quadroTipo === "molduraMadeira") {
    return nSize.w + frameThickness * 2;
  }

  return nSize.w;
}

/** Calcula um size refinado por tipo de quadro para manter realismo (fotografias um pouco menores). */
function normalizeSize(size, quadroTipo) {
  const base = { w: 0.36, h: 0.36, d: 0.035, ...(size || {}) };

  // fator de escala suave por tipo
  let scale = 1.0;
  if (quadroTipo === "fotografia")
    scale = 0.84; // fotos levemente menores e realistas
  else if (quadroTipo === "molduraPreta")
    scale = 0.92; // moldura leve um pouco menor
  else if (quadroTipo === "molduraMadeira")
    scale = 0.96; // moldura rústica mais espessa
  else scale = 0.94; // canvas branco padrão um pouco menor

  return {
    w: base.w * scale,
    h: base.h * scale,
    d: base.d,
  };
}

/**
 * Agrupa quadros por linha (Y aproximado) e distribui cada linha com:
 * - gap uniforme (auto ou fixo)
 * - centrados entre si (linha inteira centrada em X=0)
 */
function spreadByRows(parentGroup, { minGapX = "auto", rowSnap = 0.08 } = {}) {
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
    if (row.length === 0) continue;

    // ordena por X atual só para termos uma ordem consistente
    row.sort((a, b) => a.position.x - b.position.x);

    const widths = row.map((n) => n.userData?.outerW ?? 0.25);
    const avgW = widths.reduce((s, w) => s + w, 0) / Math.max(widths.length, 1);

    // gap automático: fração da largura média (um pouco menor que antes)
    let gap = 0.1; // default reduzido
    if (minGapX === "auto") {
      // antes: clamp 0.06..0.14 com fator 0.30
      // agora: clamp 0.045..0.10 com fator 0.22 (mais compacto)
      gap = Math.max(0.045, Math.min(0.1, 0.22 * avgW));
    } else if (typeof minGapX === "number") {
      gap = Math.max(0.02, minGapX);
    }

    const totalFramesW = widths.reduce((s, w) => s + w, 0);
    const totalWidth = totalFramesW + gap * (row.length - 1);

    // início em -metade, de modo que a linha fique centrada em X=0
    let cursorX = -totalWidth / 2;

    for (let i = 0; i < row.length; i++) {
      const w = widths[i];
      const targetCenter = cursorX + w / 2;
      // posiciona quadro
      row[i].position.x = targetCenter;
      // micro separação no Z por ordem (reforça leitura individual)
      row[i].position.z += i * 0.0003;
      // avança cursor
      cursorX += w + (i < row.length - 1 ? gap : 0);
    }
  }
}

function addQuadro(group, textureURL, position, size, quadroTipo = "moldura") {
  getTexture(textureURL)
    .then((texture) => {
      // helpers anti z-fighting
      const POLY_OFFSET = {
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      };

      // aplica normalização de tamanho por tipo (fotografias um pouco menores)
      const nSize = normalizeSize(size, quadroTipo);

      const woodTexture =
        quadroTipo === "molduraMadeira" ? createWoodTexture(THREE) : null;

      // ===== TIPO FOTOGRAFIA — papel com janela (anel extrudado) e foto recuada =====
      if (quadroTipo === "fotografia") {
        const photoGroup = new THREE.Group();
        photoGroup.userData = { kind: "quadro" };
        photoGroup.position.set(position.x, position.y, position.z);
        photoGroup.rotation.y = Math.PI;

        // parâmetros visuais finos/realistas
        const paperBorder = 0.01; // ~1 cm de borda
        const paperThick = 0.0042;
        const photoRecess = 0.0012;
        const cornerRadius = Math.min(nSize.w, nSize.h) * 0.06;

        // dimensões
        const paperW = nSize.w + paperBorder * 2;
        const paperH = nSize.h + paperBorder * 2;

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
          nSize.w,
          nSize.h,
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
        const photoGeo = new THREE.PlaneGeometry(nSize.w, nSize.h);
        const photoMesh = new THREE.Mesh(photoGeo, photoMaterial);
        // a face frontal do papel está em +paperThick/2; foto fica um pouco atrás
        photoMesh.position.set(0, 0, paperThick / 2 - photoRecess);
        photoMesh.renderOrder = 1;
        photoGroup.add(photoMesh);

        // 3) FITAS discretas nos cantos superiores
        const tapeW = Math.min(nSize.w, nSize.h) * 0.22;
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
        const frameDepth = Math.max(nSize.d ?? 0.028, 0.028) + 0.012;
        const matOverlap = 0.012; // pouca cobertura

        const outerW = nSize.w + frameThickness * 2;
        const outerH = nSize.h + frameThickness * 2;
        const innerW = Math.max(nSize.w - matOverlap * 2, 0.01);
        const innerH = Math.max(nSize.h - matOverlap * 2, 0.01);

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
          new THREE.PlaneGeometry(nSize.w, nSize.h),
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
          opacity: 0.42,
          roughness: 0.1,
          metalness: 0.0,
          transmission: 0.7,
          ior: 1.25,
          thickness: 0.009,
          clearcoat: 0.25,
          clearcoatRoughness: 0.4,
        });
        const glass = new THREE.Mesh(
          new THREE.PlaneGeometry(innerW, innerH),
          glassMaterial,
        );
        glass.position.set(0, 0, frameDepth / 2 - 0.001);
        frameGroup.add(glass);

        frameGroup.userData.outerW = outerW;
        group.add(frameGroup);
        return;
      }

      // ===== TIPO MOLDURA PADRÃO =====
      const frameGroup = new THREE.Group();
      frameGroup.userData = { kind: "quadro" };
      frameGroup.position.set(position.x, position.y, position.z);
      frameGroup.rotation.y = Math.PI;

      // normaliza tamanho (usa dados defaults quando não vier)
      const frameSize = nSize;
      frameGroup.userData.outerW = computeOuterWidth(size, quadroTipo);

      // pintura / foto
      const fotoGeometry = new THREE.PlaneGeometry(frameSize.w, frameSize.h);
      const fotoMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        color: 0xffffff,
        roughness: 0.4,
        metalness: 0.08,
        clearcoat: 0.12,
        clearcoatRoughness: 0.55,
        ...POLY_OFFSET,
      });
      const fotoMesh = new THREE.Mesh(fotoGeometry, fotoMaterial);
      fotoMesh.position.z = 0.011;
      fotoMesh.castShadow = true;
      fotoMesh.receiveShadow = true;
      frameGroup.add(fotoMesh);

      // moldura (caixa) simples e não profunda
      const frameThickness = quadroTipo === "molduraMadeira" ? 0.017 : 0.018;
      const frameDepth = quadroTipo === "molduraMadeira" ? 0.03 : 0.034;
      const frameMaterial = new THREE.MeshPhysicalMaterial({
        color: quadroTipo === "molduraMadeira" ? 0xc5a376 : 0x111111,
        map: woodTexture,
        roughness: quadroTipo === "molduraMadeira" ? 0.52 : 0.48,
        metalness: quadroTipo === "molduraMadeira" ? 0.18 : 0.12,
        clearcoat: quadroTipo === "molduraMadeira" ? 0.05 : 0.12,
        clearcoatRoughness: 0.52,
        ...POLY_OFFSET,
      });

      const frameGeometry = new THREE.BoxGeometry(
        frameSize.w + frameThickness * 2,
        frameSize.h + frameThickness * 2,
        frameDepth,
      );
      const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      frameGroup.add(frameMesh);

      // ligeiro rebaixo para dar leitura de profundidade
      const innerHoleGeometry = new THREE.BoxGeometry(
        frameSize.w,
        frameSize.h,
        frameDepth * 1.02,
      );
      const innerHoleMaterial = new THREE.MeshPhysicalMaterial({
        color: quadroTipo === "molduraMadeira" ? 0xa8865b : 0x222222,
        roughness: quadroTipo === "molduraMadeira" ? 0.58 : 0.65,
        metalness: 0.08,
        clearcoat: 0.02,
        clearcoatRoughness: 0.4,
        ...POLY_OFFSET,
      });
      const innerHoleMesh = new THREE.Mesh(innerHoleGeometry, innerHoleMaterial);
      innerHoleMesh.position.z = -0.001;
      innerHoleMesh.castShadow = true;
      innerHoleMesh.receiveShadow = true;
      frameGroup.add(innerHoleMesh);

      group.add(frameGroup);
    })
    .catch((err) => {
      console.error("Falha ao carregar textura do quadro", err);
    });
}
function computeOuterWidth(size, quadroTipo) {
  const nSize = normalizeSize(size, quadroTipo);

  if (quadroTipo === "fotografia") {
    const paperBorder = 0.01;
    return nSize.w + paperBorder * 2;
  }

  const frameThickness = 0.018;
  if (quadroTipo === "molduraPreta" || quadroTipo === "molduraMadeira") {
    return nSize.w + frameThickness * 2;
  }

  return nSize.w;
}

/** Calcula um size refinado por tipo de quadro para manter realismo (fotografias um pouco menores). */
function normalizeSize(size, quadroTipo) {
  const base = { w: 0.36, h: 0.36, d: 0.035, ...(size || {}) };

  // fator de escala suave por tipo
  let scale = 1.0;
  if (quadroTipo === "fotografia")
    scale = 0.84; // fotos levemente menores e realistas
  else if (quadroTipo === "molduraPreta")
    scale = 0.92; // moldura leve um pouco menor
  else if (quadroTipo === "molduraMadeira")
    scale = 0.96; // moldura rústica mais espessa
  else scale = 0.94; // canvas branco padrão um pouco menor

  return {
    w: base.w * scale,
    h: base.h * scale,
    d: base.d,
  };
}

/**
 * Agrupa quadros por linha (Y aproximado) e distribui cada linha com:
 * - gap uniforme (auto ou fixo)
 * - centrados entre si (linha inteira centrada em X=0)
 */
function spreadByRows(parentGroup, { minGapX = "auto", rowSnap = 0.08 } = {}) {
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
    if (row.length === 0) continue;

    // ordena por X atual só para termos uma ordem consistente
    row.sort((a, b) => a.position.x - b.position.x);

    const widths = row.map((n) => n.userData?.outerW ?? 0.25);
    const avgW = widths.reduce((s, w) => s + w, 0) / Math.max(widths.length, 1);

    // gap automático: fração da largura média (um pouco menor que antes)
    let gap = 0.1; // default reduzido
    if (minGapX === "auto") {
      // antes: clamp 0.06..0.14 com fator 0.30
      // agora: clamp 0.045..0.10 com fator 0.22 (mais compacto)
      gap = Math.max(0.045, Math.min(0.1, 0.22 * avgW));
    } else if (typeof minGapX === "number") {
      gap = Math.max(0.02, minGapX);
    }

    const totalFramesW = widths.reduce((s, w) => s + w, 0);
    const totalWidth = totalFramesW + gap * (row.length - 1);

    // início em -metade, de modo que a linha fique centrada em X=0
    let cursorX = -totalWidth / 2;

    for (let i = 0; i < row.length; i++) {
      const w = widths[i];
      const targetCenter = cursorX + w / 2;
      // posiciona quadro
      row[i].position.x = targetCenter;
      // micro separação no Z por ordem (reforça leitura individual)
      row[i].position.z += i * 0.0003;
      // avança cursor
      cursorX += w + (i < row.length - 1 ? gap : 0);
    }
  }
}

function addQuadro(group, textureURL, position, size, quadroTipo = "moldura") {
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

    // aplica normalização de tamanho por tipo (fotografias um pouco menores)
    const nSize = normalizeSize(size, quadroTipo);

    const woodTexture =
      quadroTipo === "molduraMadeira" ? createWoodTexture(THREE) : null;

    // ===== TIPO FOTOGRAFIA — papel com janela (anel extrudado) e foto recuada =====
    if (quadroTipo === "fotografia") {
      const photoGroup = new THREE.Group();
      photoGroup.userData = { kind: "quadro" };
      photoGroup.position.set(position.x, position.y, position.z);
      photoGroup.rotation.y = Math.PI;

      // parâmetros visuais finos/realistas
      const paperBorder = 0.01; // ~1 cm de borda
      const paperThick = 0.0042;
      const photoRecess = 0.0012;
      const cornerRadius = Math.min(nSize.w, nSize.h) * 0.06;

      // dimensões
      const paperW = nSize.w + paperBorder * 2;
      const paperH = nSize.h + paperBorder * 2;

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
        nSize.w,
        nSize.h,
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
      const photoGeo = new THREE.PlaneGeometry(nSize.w, nSize.h);
      const photoMesh = new THREE.Mesh(photoGeo, photoMaterial);
      // a face frontal do papel está em +paperThick/2; foto fica um pouco atrás
      photoMesh.position.set(0, 0, paperThick / 2 - photoRecess);
      photoMesh.renderOrder = 1;
      photoGroup.add(photoMesh);

      // 3) FITAS discretas nos cantos superiores
      const tapeW = Math.min(nSize.w, nSize.h) * 0.22;
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
      const frameDepth = Math.max(nSize.d ?? 0.028, 0.028) + 0.012;
      const matOverlap = 0.012; // pouca cobertura

      const outerW = nSize.w + frameThickness * 2;
      const outerH = nSize.h + frameThickness * 2;
      const innerW = Math.max(nSize.w - matOverlap * 2, 0.01);
      const innerH = Math.max(nSize.h - matOverlap * 2, 0.01);

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
        new THREE.PlaneGeometry(nSize.w, nSize.h),
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

    // ===== TIPO MOLDURA DE MADEIRA RÚSTICA =====
    if (quadroTipo === "molduraMadeira") {
      const frameGroup = new THREE.Group();
      frameGroup.userData = { kind: "quadro" };
      frameGroup.position.set(position.x, position.y, position.z);
      frameGroup.rotation.y = Math.PI;

      const frameThickness = 0.018;
      const frameDepth = Math.max(nSize.d ?? 0.032, 0.032) + 0.014;
      const matOverlap = 0.012;

      const outerW = nSize.w + frameThickness * 2;
      const outerH = nSize.h + frameThickness * 2;
      const innerW = Math.max(nSize.w - matOverlap * 2, 0.01);
      const innerH = Math.max(nSize.h - matOverlap * 2, 0.01);

      const frameMaterial = new THREE.MeshStandardMaterial({
        map: woodTexture,
        color: 0xc29b67,
        roughness: 0.75,
        metalness: 0.08,
      });
      const matteMaterial = new THREE.MeshStandardMaterial({
        color: 0xf4efe6,
        roughness: 0.92,
        metalness: 0.0,
        side: THREE.DoubleSide,
        ...POLY_OFFSET,
      });
      const artworkMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        color: 0xffffff,
        roughness: 0.62,
        metalness: 0.0,
        side: THREE.FrontSide,
        ...POLY_OFFSET,
      });

      // moldura em anel extrudado com textura de madeira
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

      // fundo claro para destacar o desenho
      const backCover = new THREE.Mesh(
        new THREE.PlaneGeometry(innerW, innerH),
        matteMaterial,
      );
      backCover.position.set(0, 0, -frameDepth / 2 + 0.0006);
      backCover.receiveShadow = true;
      frameGroup.add(backCover);

      const recess = 0.0024;
      const artZ = frameDepth / 2 - recess;
      const artwork = new THREE.Mesh(
        new THREE.PlaneGeometry(nSize.w, nSize.h),
        artworkMaterial,
      );
      artwork.position.set(0, 0, artZ);
      artwork.castShadow = false;
      artwork.receiveShadow = false;
      frameGroup.add(artwork);

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
      new THREE.BoxGeometry(nSize.w, nSize.h, nSize.d),
      materials,
    );
    quadroBox.userData = { kind: "quadro", outerW: nSize.w };
    quadroBox.castShadow = true;
    quadroBox.receiveShadow = true;
    quadroBox.position.set(position.x, position.y, position.z);
    quadroBox.rotation.y = Math.PI;
    group.add(quadroBox);
  });
}

function createWoodTexture(THREE) {
  const canvas = document.createElement("canvas");
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#c8a26b";
  ctx.fillRect(0, 0, size, size);

  // veios verticais simples com ruído suave
  for (let x = 0; x < size; x += 6) {
    const hue = 35 + Math.sin(x * 0.08) * 6;
    const light = 48 + Math.random() * 18;
    ctx.fillStyle = `hsl(${hue}, 46%, ${light}%)`;
    const offset = (Math.random() - 0.5) * 8;
    ctx.fillRect(x + offset, 0, 4, size);
  }

  // pequenos nós
  for (let i = 0; i < 18; i++) {
    const radius = 8 + Math.random() * 12;
    const x = Math.random() * size;
    const y = Math.random() * size;
    const gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, "rgba(110, 80, 40, 0.65)");
    gradient.addColorStop(1, "rgba(110, 80, 40, 0)");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 8;
  texture.repeat.set(1.8, 1.8);
  texture.encoding = THREE.sRGBEncoding;
  return texture;
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

  // tenta achar a largura externa do último quadro adicionado para dimensionar o label
  const lastFrame = [...parent.children]
    .reverse()
    .find((c) => c.userData?.outerW);
  const baseW = lastFrame?.userData?.outerW ?? 0.6;
  const labelW = Math.max(0.35, Math.min(0.9, baseW * 0.7));
  const labelH = labelW * (128 / 512);

  const geometry = new THREE.PlaneGeometry(labelW, labelH);

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(offset.x, offset.y, offset.z);
  mesh.renderOrder = 999;
  parent.add(mesh);
}

function buildPreview() {
  if (!scene || !exibicaoAtiva) return;

  removePreview();

  previewGroup = new THREE.Group();
  previewGroup.visible = false;
  scene.add(previewGroup);

  const quadroTipo = exibicaoAtiva.quadroTipo ?? "moldura";
  const obras = exibicaoAtiva.obras;

  const previewMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.22,
    side: THREE.DoubleSide,
    depthWrite: false,
  });

  const outlineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.55,
    linewidth: 2,
    depthWrite: false,
  });

  obras.forEach((obra, idx) => {
    const zNudge = (idx % 3) * 0.0006;
    const pos = { ...obra.position, z: (obra.position?.z ?? 0) + zNudge };
    const nSize = normalizeSize(obra.size, quadroTipo);

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(nSize.w, nSize.h),
      previewMaterial.clone(),
    );
    plane.position.set(pos.x, pos.y, pos.z);
    plane.rotation.y = Math.PI;
    plane.userData = {
      kind: "quadro",
      outerW: computeOuterWidth(obra.size, quadroTipo),
    };

    const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(nSize.w, nSize.h));
    const outline = new THREE.LineSegments(edges, outlineMaterial.clone());
    outline.position.set(pos.x, pos.y, pos.z + 0.0003);
    outline.rotation.y = Math.PI;

    previewGroup.add(plane);
    previewGroup.add(outline);
  });

  if (exibicaoAtiva.autoSpread !== false) {
    spreadByRows(previewGroup, {
      minGapX: "auto",
      rowSnap: 0.08,
    });
  }
}

function removePreview() {
  if (previewGroup && scene) {
    scene.remove(previewGroup);
  }
  previewGroup = null;
}

function getTexture(url) {
  if (!url) return Promise.reject(new Error("URL inválida"));
  if (textureCache.has(url)) return textureCache.get(url);

  sharedLoader ||= new THREE.TextureLoader();

  const promise = new Promise((resolve, reject) => {
    sharedLoader.load(
      url,
      (texture) => {
        texture.encoding = THREE.sRGBEncoding;
        texture.anisotropy = 8;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        resolve(texture);
      },
      undefined,
      reject,
    );
  });

  textureCache.set(url, promise);
  return promise;
}

function preloadTexturesForExibicao() {
  if (!exibicaoAtiva || !THREE) return;
  exibicaoAtiva.obras?.forEach((obra) => {
    if (obra.url) {
      getTexture(obra.url).catch(() => {
        /* ignora erros de pré-carregamento */
      });
    }
  });
}

export function updatePreviewFromReticle() {
  if (!camera || !scene || !reticle || wallPlaced || !exibicaoAtiva) {
    removePreview();
    return;
  }

  if (!reticle.visible) {
    if (previewGroup) previewGroup.visible = false;
    return;
  }

  if (!previewGroup) buildPreview();
  if (!previewGroup) return;

  const reticlePos = new THREE.Vector3().setFromMatrixPosition(reticle.matrix);
  const camPos = camera.getWorldPosition(new THREE.Vector3());
  const lookDir = new THREE.Vector3().subVectors(camPos, reticlePos);
  lookDir.y = 0;
  lookDir.normalize();

  previewGroup.position.copy(reticlePos);
  previewGroup.quaternion.setFromRotationMatrix(
    new THREE.Matrix4().lookAt(
      new THREE.Vector3(0, 0, 0),
      lookDir,
      new THREE.Vector3(0, 1, 0),
    ),
  );

  previewGroup.visible = true;
}

// limpa a parede atual e permite nova interação RA
export function resetWall() {
  if (currentWall && scene) {
    scene.remove(currentWall);
    currentWall = null;
  }
  wallPlaced = false;
  removePreview();
}

export function isWallPlaced() {
  return wallPlaced;
}
