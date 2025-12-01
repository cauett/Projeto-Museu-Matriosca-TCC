export let video, canvas, ctx;

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

  const sampleSize = 120;
  const targetSize = 80;
  canvas.width = targetSize;
  canvas.height = targetSize;

  // captura uma área maior e reduzida suavemente, o que ajuda a privilegiar a textura predominante
  ctx.imageSmoothingEnabled = true;
  ctx.filter = "blur(3px)";
  ctx.drawImage(
    video,
    w / 2 - sampleSize / 2,
    h / 2 - sampleSize / 2,
    sampleSize,
    sampleSize,
    0,
    0,
    targetSize,
    targetSize,
  );
  ctx.filter = "";

  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
  const data = imageData.data;

  // histograma simples por bucket (16 níveis por canal) para encontrar a cor dominante
  const buckets = new Map();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] >> 4;
    const g = data[i + 1] >> 4;
    const b = data[i + 2] >> 4;
    const key = (r << 8) | (g << 4) | b;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  let dominantKey = null;
  let dominantCount = -1;
  for (const [key, count] of buckets) {
    if (count > dominantCount) {
      dominantKey = key;
      dominantCount = count;
    }
  }

  let domR = 200,
    domG = 200,
    domB = 200;
  if (dominantKey !== null) {
    domR = ((dominantKey >> 8) & 0xf) * 16 + 8;
    domG = ((dominantKey >> 4) & 0xf) * 16 + 8;
    domB = (dominantKey & 0xf) * 16 + 8;
  }

  // recria a textura com a cor predominante e um leve ruído para não ficar chapado
  const outData = ctx.createImageData(targetSize, targetSize);
  for (let i = 0; i < outData.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 6;
    outData.data[i] = Math.max(0, Math.min(255, domR + noise));
    outData.data[i + 1] = Math.max(0, Math.min(255, domG + noise));
    outData.data[i + 2] = Math.max(0, Math.min(255, domB + noise));
    outData.data[i + 3] = 255;
  }
  ctx.putImageData(outData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}
