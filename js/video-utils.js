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

  const sampleSize = 64;
  const cropSize = Math.min(w, h) * 0.35;
  canvas.width = sampleSize;
  canvas.height = sampleSize;

  ctx.filter = "blur(6px) saturate(0.9)";
  ctx.drawImage(
    video,
    w / 2 - cropSize / 2,
    h / 2 - cropSize / 2,
    cropSize,
    cropSize,
    0,
    0,
    sampleSize,
    sampleSize,
  );
  ctx.filter = "none";

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
  const data = imageData.data;

  let rSum = 0,
    gSum = 0,
    bSum = 0;
  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }
  const totalPixels = sampleSize * sampleSize;
  const avgColor = {
    r: rSum / totalPixels,
    g: gSum / totalPixels,
    b: bSum / totalPixels,
  };

  for (let y = 0; y < sampleSize; y++) {
    const vFade = Math.min(y / 18.5, (sampleSize - y) / 18.5, 1);
    for (let x = 0; x < sampleSize; x++) {
      const hFade = Math.min(x / 18.5, (sampleSize - x) / 18.5, 1);
      const i = (y * sampleSize + x) * 4;
      const fade = Math.min(hFade, vFade);

      data[i] = data[i] * 0.35 + avgColor.r * 0.65;
      data[i + 1] = data[i + 1] * 0.35 + avgColor.g * 0.65;
      data[i + 2] = data[i + 2] * 0.35 + avgColor.b * 0.65;
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
