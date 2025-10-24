export function getDeviceXRStatus() {
  const nav = typeof navigator !== "undefined" ? navigator : {};
  const ua = nav.userAgent || nav.vendor || "";
  const platform = nav.userAgentData?.platform || nav.platform || "";

  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && nav.maxTouchPoints > 1);

  const hasWebXR = typeof nav.xr !== "undefined";

  const shouldDisableAR = isIOS && !hasWebXR;

  let message = "";
  if (shouldDisableAR) {
    message =
      "A experiência de realidade aumentada não está disponível no navegador padrão do iPhone. Utilize um navegador compatível com WebXR, como o WebXR Viewer da Mozilla ou outro navegador que ofereça suporte.";
  }

  return {
    isIOS,
    hasWebXR,
    shouldDisableAR,
    message,
  };
}
