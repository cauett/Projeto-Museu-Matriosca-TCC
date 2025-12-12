// wall utils (moldura preta = CAIXA fechada + porta-retrato fino + espaçamento automático + fotografia refinada)
let THREE, camera, scene, reticle;
let wallPlaced = false;
let exibicaoAtiva = null;
let currentWall = null; // parede atual da sessão

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
    currentWall = wall; // guarda referência da parede atual
    wallPlaced = true;
    reticle.visible = false;

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
  else if (quadroTipo === "tecido") scale = 1.0; // tecidos mantêm proporção real
  else scale = 0.94; // canvas branco padrão um pouco menor

  return {
    w: base.w * scale,
    h: base.h * scale,
    d: base.d,
  };
}

// Mantém a proporção original da imagem, preservando a área definida no size
function applyTextureAspect(size, texture) {
  const ratio = texture?.image?.width && texture?.image?.height
    ? texture.image.width / texture.image.height
    : size.w / size.h;

  if (!isFinite(ratio) || ratio <= 0) return size;

  const area = (size?.w || 0.36) * (size?.h || 0.36);
  const width = Math.sqrt(area * ratio);
  const height = width / ratio;

  return { w: width, h: height, d: size?.d ?? 0.035 };
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
    const nSize = applyTextureAspect(normalizeSize(size, quadroTipo), texture);

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

    // ===== TIPO TECIDO — sem moldura, com textura e ondulação =====
    if (quadroTipo === "tecido") {
      const fabricGroup = new THREE.Group();
      fabricGroup.userData = { kind: "quadro", outerW: nSize.w };
      fabricGroup.position.set(position.x, position.y, position.z);
      fabricGroup.rotation.y = Math.PI;

      const clothGeometry = new THREE.PlaneGeometry(
        nSize.w,
        nSize.h,
        28,
        36,
      );

      const posAttr = clothGeometry.getAttribute("position");
      for (let i = 0; i < posAttr.count; i++) {
        const ix = i * 3;
        const y = posAttr.array[ix + 1];
        const x = posAttr.array[ix];
        const sag = Math.sin(((y + nSize.h / 2) / nSize.h) * Math.PI) * 0.008;
        const ripple = Math.sin((x / nSize.w) * Math.PI * 2.6) * 0.004;
        posAttr.array[ix + 2] = sag + ripple + (Math.random() - 0.5) * 0.0015;
      }
      posAttr.needsUpdate = true;
      clothGeometry.computeVertexNormals();

      const weaveTexture = createFabricWeaveTexture(THREE);
      const backsideMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xf5f0e9,
        roughness: 0.92,
        metalness: 0.0,
        side: THREE.BackSide,
      });
      const fabricMaterial = new THREE.MeshPhysicalMaterial({
        map: texture,
        roughness: 0.9,
        metalness: 0.0,
        sheen: 0.35,
        sheenRoughness: 0.85,
        clearcoat: 0.08,
        clearcoatRoughness: 0.9,
        bumpMap: weaveTexture,
        bumpScale: 0.016,
        roughnessMap: weaveTexture,
        side: THREE.FrontSide,
        ...POLY_OFFSET,
      });

      const front = new THREE.Mesh(clothGeometry, fabricMaterial);
      front.castShadow = true;
      front.receiveShadow = true;
      front.position.z = 0.0008;

      const back = new THREE.Mesh(clothGeometry.clone(), backsideMaterial);
      back.rotation.y = Math.PI;
      back.position.z = -0.0008;
      back.castShadow = true;
      back.receiveShadow = true;

      fabricGroup.add(front);
      fabricGroup.add(back);
      group.add(fabricGroup);
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

function createFabricWeaveTexture(THREE) {
  const canvas = document.createElement("canvas");
  const size = 256;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#d9d1c6";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "rgba(255,255,255,0.3)";
  for (let y = 0; y < size; y += 6) {
    ctx.fillRect(0, y, size, 2);
  }
  ctx.fillStyle = "rgba(210,196,180,0.35)";
  for (let x = 0; x < size; x += 6) {
    ctx.fillRect(x, 0, 2, size);
  }

  // ruído suave para quebrar padrão
  const imageData = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + noise));
    imageData.data[i + 1] = Math.min(
      255,
      Math.max(0, imageData.data[i + 1] + noise),
    );
    imageData.data[i + 2] = Math.min(
      255,
      Math.max(0, imageData.data[i + 2] + noise * 0.8),
    );
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3.2, 3.2);
  texture.anisotropy = 8;
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

// limpa a parede atual e permite nova interação RA
export function resetWall() {
  if (currentWall && scene) {
    scene.remove(currentWall);
    currentWall = null;
  }
  wallPlaced = false;
}

export function isWallPlaced() {
  return wallPlaced;
}
