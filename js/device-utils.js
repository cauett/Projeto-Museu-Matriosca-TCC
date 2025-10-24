export function getDeviceXRStatus() {
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const ua = nav.userAgent || nav.vendor || "";
  const platform = nav.userAgentData?.platform || nav.platform || "";

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && nav.maxTouchPoints > 1);

  const hasWebXR = typeof nav.xr !== "undefined";
  const hasMediaDevices = !!nav.mediaDevices?.getUserMedia;

  let mode = "webxr";
  let message = "";
  let startLabel = "Iniciar AR";

  if (hasWebXR) {
    mode = "webxr";
  } else if (hasMediaDevices) {
    mode = "fallback";
    startLabel = "Iniciar modo alternativo";
    message =
      "O navegador deste dispositivo não oferece suporte ao WebXR. Iniciaremos um modo alternativo de visualização usando a câmera para que você possa explorar as obras.";
  } else {
    mode = "unsupported";
    startLabel = "AR indisponível";
    message =
      "Este dispositivo não possui suporte ao WebXR nem acesso à câmera necessário para o modo alternativo.";
  }

  return {
    isIOS,
    hasWebXR,
    hasMediaDevices,
    mode,
    message,
    startLabel,
  };
}
