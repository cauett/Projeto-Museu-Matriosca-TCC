export let video, canvas, ctx;

// estado suavizado para evitar flicker ao detectar paredes lisas
let smoothConfidence = 0;

// Detecta superfícies lisas de forma mais robusta, usando luminância, bordas e
// variação cromática em vez de depender de uma cor sólida específica.
export function detectFlatWallPresence({
  size = 156,
  tiles = 3,
  edgeThreshold = 14,
  edgeDensityMax = 0.2,
  luminanceVarianceMax = 6800,
  chromaVarianceMax = 3200,
  tileEdgeMax = 0.23,
  tileVarianceMax = 9200,
  smoothing = 0.8,
} = {}) {
  const w = video?.videoWidth;
  const h = video?.videoHeight;
  if (!w || !h) return { detected: false };

  canvas.width = size;
  canvas.height = size;

  // usa o maior quadrado possível do frame para cobrir a parede inteira vista pela câmera
  const sampleSide = Math.min(w, h);
  const offsetX = (w - sampleSide) / 2;
  const offsetY = (h - sampleSide) / 2;
  ctx.drawImage(video, offsetX, offsetY, sampleSide, sampleSide, 0, 0, size, size);

  const { data } = ctx.getImageData(0, 0, size, size);
  const totalPixels = size * size;

  // Pré-calcula luminância para medir variação de intensidade independente de cor.
  const luminances = new Float32Array(totalPixels);
  let sumL = 0;
  let sumR = 0,
    sumG = 0,
    sumB = 0;

  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const l = 0.299 * r + 0.587 * g + 0.114 * b;

    luminances[p] = l;
    sumL += l;
    sumR += r;
    sumG += g;
    sumB += b;
  }

  const avgL = sumL / totalPixels;
  const avgR = sumR / totalPixels;
  const avgG = sumG / totalPixels;
  const avgB = sumB / totalPixels;

  // Variação de luminância: baixa textura = parede lisa mesmo com sombra suave.
  let luminanceVar = 0;
  for (let i = 0; i < luminances.length; i++) {
    const d = luminances[i] - avgL;
    luminanceVar += d * d;
  }
  const normLumVariance = luminanceVar / totalPixels;

  // Variação cromática: paredes mudam de tom com sombra, então toleramos mais.
  let chromaVar = 0;
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - avgR;
    const dg = data[i + 1] - avgG;
    const db = data[i + 2] - avgB;
    chromaVar += dr * dr + dg * dg + db * db;
  }
  const normChromaVariance = chromaVar / totalPixels;

  // Densidade de bordas: paredes lisas têm poucas bordas fortes.
  let strongEdges = 0;
  const width = size;
  const height = size;
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -luminances[idx - width - 1] - 2 * luminances[idx - 1] -
        luminances[idx + width - 1] +
        luminances[idx - width + 1] + 2 * luminances[idx + 1] +
        luminances[idx + width + 1];
      const gy =
        -luminances[idx - width - 1] - 2 * luminances[idx - width] -
        luminances[idx - width + 1] +
        luminances[idx + width - 1] + 2 * luminances[idx + width] +
        luminances[idx + width + 1];
      const mag = Math.abs(gx) + Math.abs(gy);
      if (mag > edgeThreshold) strongEdges++;
    }
  }

  const edgeDensity = strongEdges / totalPixels;

  // Avalia textura local em um grid (tiles) para garantir que qualquer região ampla
  // da parede seja reconhecida, não apenas o centro.
  const tileSize = Math.floor(size / tiles);
  let tilesLowEdge = 0;
  let tilesLowVariance = 0;

  for (let ty = 0; ty < tiles; ty++) {
    for (let tx = 0; tx < tiles; tx++) {
      let tileEdges = 0;
      let tileLumVar = 0;
      let tileCount = 0;

      // média local
      let tileSumL = 0;
      for (let y = 1; y < tileSize - 1; y++) {
        for (let x = 1; x < tileSize - 1; x++) {
          const gx = tx * tileSize + x;
          const gy = ty * tileSize + y;
          const idx = gy * width + gx;
          const l = luminances[idx];
          tileSumL += l;
          tileCount++;
        }
      }
      const tileAvg = tileSumL / Math.max(tileCount, 1);

      for (let y = 1; y < tileSize - 1; y++) {
        for (let x = 1; x < tileSize - 1; x++) {
          const gx = tx * tileSize + x;
          const gy = ty * tileSize + y;
          const idx = gy * width + gx;

          const gxGrad =
            -luminances[idx - width - 1] - 2 * luminances[idx - 1] -
            luminances[idx + width - 1] +
            luminances[idx - width + 1] + 2 * luminances[idx + 1] +
            luminances[idx + width + 1];
          const gyGrad =
            -luminances[idx - width - 1] - 2 * luminances[idx - width] -
            luminances[idx - width + 1] +
            luminances[idx + width - 1] + 2 * luminances[idx + width] +
            luminances[idx + width + 1];
          const mag = Math.abs(gxGrad) + Math.abs(gyGrad);
          if (mag > edgeThreshold) tileEdges++;

          const d = luminances[idx] - tileAvg;
          tileLumVar += d * d;
        }
      }

      const tilePixels = (tileSize - 2) * (tileSize - 2);
      const tileEdgeDensity = tileEdges / Math.max(tilePixels, 1);
      const tileVariance = tileLumVar / Math.max(tilePixels, 1);

      if (tileEdgeDensity < tileEdgeMax) tilesLowEdge++;
      if (tileVariance < tileVarianceMax) tilesLowVariance++;
    }
  }

  const tilesSampled = tiles * tiles;
  const coverageLowEdge = tilesLowEdge / tilesSampled;
  const coverageLowVariance = tilesLowVariance / tilesSampled;

  const uniformityScore = Math.max(0, 1 - normLumVariance / luminanceVarianceMax);
  const chromaSmoothness = Math.max(0, 1 - normChromaVariance / chromaVarianceMax);
  const edgeSimplicity = Math.max(0, 1 - edgeDensity / edgeDensityMax);
  const surfaceCoverage = Math.min(1, (coverageLowEdge + coverageLowVariance) / 2);
  const coverageBoost = surfaceCoverage > 0.72 ? 0.08 : 0;

  // Peso maior para uniformidade, ausência de bordas e cobertura espacial.
  const rawConfidence =
    0.3 * uniformityScore +
    0.28 * edgeSimplicity +
    0.24 * surfaceCoverage +
    0.18 * chromaSmoothness +
    coverageBoost;

  smoothConfidence = smoothing * smoothConfidence + (1 - smoothing) * rawConfidence;

  const coverageStrong = surfaceCoverage > 0.7 && edgeSimplicity > 0.5;
  const detected =
    smoothConfidence > 0.48 ||
    coverageStrong ||
    (uniformityScore > 0.6 && surfaceCoverage > 0.56) ||
    (edgeDensity < edgeDensityMax * 0.95 && normLumVariance < luminanceVarianceMax * 0.95);

  return {
    detected,
    edgeDensity,
    uniformityScore,
    edgeSimplicity,
    chromaSmoothness,
    normLumVariance,
    normChromaVariance,
    smoothConfidence,
    surfaceCoverage,
    avgColor: { r: avgR, g: avgG, b: avgB },
  };
}

export async function initVideoStream() {
  video = document.createElement("video");
  video.setAttribute("autoplay", "");
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.style.display = "none";
  document.body.appendChild(video);

  canvas = document.createElement("canvas");
  canvas.style.display = "none";
  ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = stream;
    await video.play();
  } catch (err) {
    console.error("Erro ao acessar a câmera:", err);
  }
}

export function getWallTextureFromVideo(THREE) {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;

  const sampleSize = 64;
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  ctx.drawImage(video, w / 2 - 32, h / 2 - 32, 64, 64, 0, 0, 64, 64);

  const imageData = ctx.getImageData(0, 0, 64, 64);
  const data = imageData.data;

  for (let y = 0; y < 64; y++) {
    const vFade = Math.min(y / 18.5, (64 - y) / 18.5, 1);
    for (let x = 0; x < 64; x++) {
      const hFade = Math.min(x / 18.5, (64 - x) / 18.5, 1);
      const i = (y * 64 + x) * 4;
      const fade = Math.min(hFade, vFade);
      data[i + 3] *= fade;
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
