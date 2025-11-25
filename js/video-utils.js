export let video, canvas, ctx;

// Detecta superfícies lisas com cor predominante para liberar o retículo
// mesmo quando não há pontos de feature suficientes para o hit test.
export function detectFlatWallPresence({
  size = 64,
  varianceThreshold = 420,
  dominanceThreshold = 0.62,
  tolerance = 16,
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

  let sumR = 0,
    sumG = 0,
    sumB = 0;

  for (let i = 0; i < data.length; i += 4) {
    sumR += data[i];
    sumG += data[i + 1];
    sumB += data[i + 2];
  }

  const avgR = sumR / totalPixels;
  const avgG = sumG / totalPixels;
  const avgB = sumB / totalPixels;

  // Variância baixa indica poucos detalhes/ruído — provável parede lisa
  let variance = 0;
  let dominantCount = 0;

  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - avgR;
    const dg = data[i + 1] - avgG;
    const db = data[i + 2] - avgB;

    variance += dr * dr + dg * dg + db * db;

    if (Math.abs(dr) < tolerance && Math.abs(dg) < tolerance && Math.abs(db) < tolerance) {
      dominantCount++;
    }
  }

  const normVariance = variance / totalPixels;
  const dominantRatio = dominantCount / totalPixels;

  const detected = normVariance < varianceThreshold && dominantRatio > dominanceThreshold;

  return {
    detected,
    dominantRatio,
    normVariance,
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
