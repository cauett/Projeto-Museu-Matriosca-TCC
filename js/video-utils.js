export let video, canvas, ctx;
let streamRef = null;
let videoReady = false;

export async function initVideoStream() {
  if (!video) {
    video = document.createElement("video");
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.style.display = "none";
    document.body.appendChild(video);
  }

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.style.display = "none";
    ctx = canvas.getContext("2d");
    document.body.appendChild(canvas);
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    const err = new Error("API de câmera não suportada neste dispositivo.");
    console.error(err.message);
    window.dispatchEvent(new CustomEvent("video-stream-error", { detail: err }));
    return false;
  }

  if (streamRef && videoReady) {
    window.dispatchEvent(new CustomEvent("video-stream-ready"));
    return true;
  }

  try {
    streamRef = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    video.srcObject = streamRef;
    await video.play();
    videoReady = true;
    window.dispatchEvent(new CustomEvent("video-stream-ready"));
    return true;
  } catch (err) {
    videoReady = false;
    console.error("Erro ao acessar a câmera:", err);
    window.dispatchEvent(new CustomEvent("video-stream-error", { detail: err }));
    return false;
  }
}

export function getWallTextureFromVideo(THREE) {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!videoReady || !w || !h) {
    return createFallbackWallTexture(THREE);
  }

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

  return buildTextureFromCanvas(THREE);
}

function buildTextureFromCanvas(THREE) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearMipMapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createFallbackWallTexture(THREE) {
  const size = 64;
  if (!canvas) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d");
  }
  canvas.width = size;
  canvas.height = size;
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, "#2f1a19");
  gradient.addColorStop(1, "#1b0f12");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "rgba(255,255,255,0.05)";
  ctx.fillRect(0, size * 0.65, size, size * 0.35);
  return buildTextureFromCanvas(THREE);
}

export function stopVideoStream() {
  if (streamRef) {
    streamRef.getTracks().forEach((track) => track.stop());
    streamRef = null;
    videoReady = false;
  }
  if (video) {
    video.pause?.();
    video.srcObject = null;
  }
}

export function isVideoReady() {
  return videoReady;
}
