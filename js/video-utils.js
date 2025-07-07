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
