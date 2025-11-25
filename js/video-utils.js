export let video, canvas, ctx;

// estado suavizado para evitar flicker ao detectar paredes lisas
let smoothConfidence = 0;

// Detecta superfícies lisas de forma mais robusta, usando luminância, bordas e
// variação cromática em vez de depender de uma cor sólida específica.
export function detectFlatWallPresence({
  size = 128,
  edgeThreshold = 18,
  edgeDensityMax = 0.14,
  luminanceVarianceMax = 5400,
  chromaVarianceMax = 2200,
  smoothing = 0.86,
} = {}) {
  const w = video?.videoWidth;
  const h = video?.videoHeight;
  if (!w || !h) return { detected: false };

  canvas.width = size;
  canvas.height = size;

  const half = size / 2;
  ctx.drawImage(video, w / 2 - half, h / 2 - half, size, size, 0, 0, size, size);

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

  const uniformityScore = Math.max(0, 1 - normLumVariance / luminanceVarianceMax);
  const chromaSmoothness = Math.max(0, 1 - normChromaVariance / chromaVarianceMax);
  const edgeSimplicity = Math.max(0, 1 - edgeDensity / edgeDensityMax);

  // Peso maior para uniformidade e ausência de bordas, cromática apenas suaviza.
  const rawConfidence = 0.45 * uniformityScore + 0.4 * edgeSimplicity + 0.15 * chromaSmoothness;

  smoothConfidence = smoothing * smoothConfidence + (1 - smoothing) * rawConfidence;

  const detected =
    smoothConfidence > 0.52 ||
    (uniformityScore > 0.7 && edgeSimplicity > 0.65) ||
    (edgeDensity < edgeDensityMax * 0.75 && normLumVariance < luminanceVarianceMax * 0.9);

  return {
    detected,
    edgeDensity,
    uniformityScore,
    edgeSimplicity,
    chromaSmoothness,
    normLumVariance,
    normChromaVariance,
    smoothConfidence,
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
