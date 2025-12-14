// Gerencia carregamento das exposições e toda a navegação da interface web.
function mapObras(itens, { autor: autorPadrao, size: sizePadrao } = {}) {
  return (itens ?? []).map(({ arquivo, url, ...obra }) => ({
    ...obra,
    url: url ?? (arquivo ? `img/${arquivo}` : undefined),
    autor: obra.autor ?? autorPadrao,
    size: obra.size ?? sizePadrao,
  }));
}

function resolveSize(sizeKeyOrObj, sizes, fallback) {
  if (!sizeKeyOrObj) return fallback;
  if (typeof sizeKeyOrObj === "string") return sizes?.[sizeKeyOrObj] ?? fallback;
  return sizeKeyOrObj;
}

export async function loadData() {
  const [base, info] = await Promise.all([
    fetch("./data/exibicoes.json").then((r) => r.json()),
    fetch("./data/exibicoesInfo.json").then((r) => r.json()),
  ]);

  const sizes = base?.sizes ?? {};
  const exibicoes = (base?.exibicoes ?? []).map((ex) => {
    const sizePadrao = resolveSize(
      ex.defaults?.sizeKey,
      sizes,
      sizes.DEFAULT_OBRA_SIZE,
    );

    return {
      ...ex,
      obras: mapObras(ex.obras, { autor: ex.defaults?.autor, size: sizePadrao }),
    };
  });

  return { exibicoes, exibicoesInfo: info ?? {}, sizes };
}

export function initUI(
  startCallback,
  { exibicoes: exibicoesData = [], exibicoesInfo: exibicoesInfoData = {} } = {},
) {
  const uiContainer = document.getElementById("ui");
  const galleryRoot = document.getElementById("gallery-ui");
  const introScreen = document.getElementById("intro-screen");
  const carouselScreen = document.getElementById("carousel-screen");
  const detailsScreen = document.getElementById("details-screen");

  const exibicoes = exibicoesData;
  const exibicoesInfo = exibicoesInfoData;

  if (!exibicoes.length) {
    console.warn("Nenhuma exposição carregada.");
    return;
  }

  const ROUTES = {
    INTRO: "intro",
    CAROUSEL: "exposicoes",
    DETAILS: "detalhes",
  };
  let navigationIndex = 0;

  const enterGalleryBtn = document.getElementById("enter-gallery-btn");
  const backToIntroBtn = document.getElementById("back-to-intro");
  const voltarBtn = document.getElementById("voltar-btn");

  const carouselWindow = document.querySelector(".carousel-window");
  const carouselTrack = document.getElementById("carousel-track");
  const carouselPrev = document.getElementById("carousel-prev");
  const carouselNext = document.getElementById("carousel-next");
  const carouselTitle = document.getElementById("carousel-title");
  const carouselDescription = document.getElementById("carousel-description");
  const viewDetailsBtn = document.getElementById("view-details-btn");
  const carouselIndicators = document.getElementById("carousel-indicators");

  const tituloEl = document.getElementById("exibicao-titulo");
  const descEl = document.getElementById("exibicao-descricao");
  const obrasLista = document.getElementById("obras-lista");
  const startBtn = document.getElementById("start-ar-btn");
  const imageModal = document.getElementById("image-modal");
  const modalImage = document.getElementById("image-modal-img");
  const modalCaption = document.getElementById("image-modal-caption");
  const openInfoBtn = document.getElementById("open-info-btn");
  const infoModal = document.getElementById("info-modal");
  const infoCuratorial = document.getElementById("info-curatorial");
  const infoCredits = document.getElementById("info-credits");
  const infoTitle = document.getElementById("info-modal-title");
  const infoAudioBtn = document.getElementById("info-audio-btn");
  const infoAudioLabel = infoAudioBtn?.querySelector(".info-audio-btn__label");

  const speechSupported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  let currentExibicao = exibicoes[0];
  let currentIndex = 0;
  let infoAudioText = "";
  let currentUtterance = null;

  const screens = [introScreen, carouselScreen, detailsScreen];

  function buildHash(screen, exibicaoId) {
    if (screen === ROUTES.DETAILS && exibicaoId) {
      return `#${ROUTES.DETAILS}/${exibicaoId}`;
    }
    return `#${screen}`;
  }

  function navigateTo(screen, { exibicaoId = null, replace = false } = {}) {
    const hash = buildHash(screen, exibicaoId);
    const state = { screen, exibicaoId, index: navigationIndex };
    if (replace) {
      window.history.replaceState(state, "", hash);
      return;
    }

    const nextIndex = navigationIndex + 1;
    window.history.pushState(
      { screen, exibicaoId, index: nextIndex },
      "",
      hash,
    );
    navigationIndex = nextIndex;
  }

  function findExibicaoById(id) {
    return exibicoes.find((ex) => ex.id === id);
  }

  function parseHash() {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return { screen: ROUTES.INTRO };

    const [screen, exibicaoId] = hash.split("/");
    if (screen === ROUTES.CAROUSEL) return { screen };
    if (screen === ROUTES.DETAILS) {
      return { screen, exibicaoId: exibicaoId ?? exibicoes[0].id };
    }

    return { screen: ROUTES.INTRO };
  }

  function setActiveScreen(screenEl) {
    screens.forEach((screen) => {
      if (screen === screenEl) {
        screen.classList.add("active");
      } else {
        screen.classList.remove("active");
      }
    });

    const isDetails = screenEl === detailsScreen;
    if (uiContainer) {
      uiContainer.classList.toggle("details-active", isDetails);
    }
    if (galleryRoot) {
      galleryRoot.classList.toggle("details-active", isDetails);
    }
    if (document?.body) {
      document.body.classList.toggle("details-active", isDetails);
    }
  }

  function buildCreditsHtml(credits = []) {
    if (!credits.length) {
      return '<p class="info-empty">Créditos não informados.</p>';
    }

    const title = '<p class="info-credits__title">Créditos</p>';
    const rows = credits
      .map(
        (credit) => `
          <div class="info-credit-row">
            <span>${credit.label}</span>
            <p>${credit.value}</p>
          </div>
        `,
      )
      .join("");

    return `${title}${rows}`;
  }

  function buildAudioNarration(info, exibicao) {
    if (!info) return "";
    const parts = [info.curatorialText?.trim()].filter(Boolean);

    if (info.credits?.length) {
      const creditNarration = info.credits
        .map((credit) => `${credit.label}: ${credit.value}`)
        .join(". ");
      parts.push(`Créditos: ${creditNarration}`);
    }

    if (exibicao?.titulo) {
      parts.unshift(`Exposição ${exibicao.titulo}.`);
    }

    return parts.join(". ");
  }

  function stopInfoAudio() {
    if (speechSupported && window.speechSynthesis?.speaking) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
    infoAudioBtn?.classList.remove("active");
    if (infoAudioLabel) {
      infoAudioLabel.textContent = "Ouvir";
    }
    infoAudioBtn?.setAttribute("aria-pressed", "false");
  }

  function toggleInfoAudio() {
    if (!speechSupported || !infoAudioText.trim()) return;

    if (window.speechSynthesis?.speaking) {
      stopInfoAudio();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(infoAudioText);
    utterance.lang = "pt-BR";
    utterance.rate = 0.98;
    utterance.pitch = 1.02;
    utterance.onend = () => stopInfoAudio();
    currentUtterance = utterance;
    window.speechSynthesis?.speak(utterance);

    infoAudioBtn?.classList.add("active");
    infoAudioBtn?.setAttribute("aria-pressed", "true");
    if (infoAudioLabel) {
      infoAudioLabel.textContent = "Parar";
    }
  }

  function setModalOpenState(isOpen) {
    if (!document?.body) return;
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else if (
      !imageModal?.classList.contains("open") &&
      !infoModal?.classList.contains("open")
    ) {
      document.body.classList.remove("modal-open");
    }
  }

  function closeInfoModal() {
    if (!infoModal) return;
    infoModal.classList.remove("open");
    infoModal.setAttribute("aria-hidden", "true");
    stopInfoAudio();
    setModalOpenState(false);
  }

  function openInfoModal() {
    if (!infoModal) return;
    infoModal.classList.add("open");
    infoModal.setAttribute("aria-hidden", "false");
    stopInfoAudio();
    if (!speechSupported && infoAudioBtn) {
      infoAudioBtn.disabled = true;
      infoAudioBtn.title =
        "A leitura em voz alta não é suportada neste dispositivo.";
    }
    setModalOpenState(true);
  }

  function updateInfoModalContent(exibicao) {
    if (!exibicao) return;
    const info = exibicoesInfo[exibicao.id];
    if (infoTitle) {
      infoTitle.textContent = exibicao.titulo;
    }
    if (infoCuratorial) {
      infoCuratorial.textContent =
        info?.curatorialText ?? "Conteúdo não disponível.";
    }
    if (infoCredits) {
      infoCredits.innerHTML = buildCreditsHtml(info?.credits ?? []);
    }
    infoAudioText = buildAudioNarration(info, exibicao);
    if (infoAudioBtn) {
      const hasAudio = Boolean(infoAudioText.trim()) && speechSupported;
      infoAudioBtn.disabled = !hasAudio;
      infoAudioBtn.title = hasAudio
        ? "Ouvir o texto completo da exposição"
        : "Leitura em voz alta indisponível.";
      infoAudioBtn.setAttribute("aria-pressed", "false");
      infoAudioBtn.classList.remove("active");
      if (infoAudioLabel) {
        infoAudioLabel.textContent = "Ouvir";
      }
    }
  }

  function goToIntro({ updateHistory = true, replace = false } = {}) {
    setActiveScreen(introScreen);
    closeInfoModal();
    if (updateHistory) {
      navigateTo(ROUTES.INTRO, { replace });
    }
  }

  function goToCarousel({ updateHistory = true, replace = false } = {}) {
    setActiveScreen(carouselScreen);
    closeInfoModal();
    goToSlide(currentIndex, { behavior: "auto" });
    if (updateHistory) {
      navigateTo(ROUTES.CAROUSEL, { replace });
    }
  }

  window.__matrioscaBackToCarousel = () => {
    goToCarousel({ updateHistory: true, replace: true });
  };

  function renderDetails(exibicao) {
    setActiveScreen(detailsScreen);
    closeInfoModal();
    updateInfoModalContent(exibicao);
    tituloEl.textContent = exibicao.titulo;
    descEl.textContent = exibicao.descricao;
    const heroCover = coverImageFor(exibicao);
    detailsScreen.style.setProperty("--details-cover", `url(${heroCover})`);
    detailsScreen.scrollTo({ top: 0, behavior: "auto" });
    obrasLista.innerHTML = "";

    exibicao.obras.forEach((obra) => {
      const div = document.createElement("div");
      div.className = "obra-item";
      div.innerHTML = `
        <button class="obra-thumb" type="button" aria-label="Ampliar ${obra.titulo}">
          <img src="${obra.url}" alt="${obra.titulo}" />
        </button>
        <div class="title">${obra.titulo}</div>
        ${obra.autor ? `<div class="autor">${obra.autor}</div>` : ""}
      `;
      div
        .querySelector(".obra-thumb")
        ?.addEventListener("click", () => openImageModal(obra));
      obrasLista.appendChild(div);
    });

    startBtn.onclick = () => startCallback(exibicao);
  }

  function openImageModal({ url, titulo }) {
    if (!imageModal || !modalImage || !url) return;
    modalImage.src = url;
    modalImage.alt = titulo ?? "Obra";
    if (modalCaption) {
      modalCaption.textContent = titulo ?? "";
    }
    imageModal.classList.add("open");
    imageModal.setAttribute("aria-hidden", "false");
    setModalOpenState(true);
  }

  function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove("open");
    imageModal.setAttribute("aria-hidden", "true");
    setModalOpenState(false);
  }

  function handleModalClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.closeModal !== undefined) {
      closeImageModal();
    }
  }

  imageModal?.addEventListener("click", handleModalClick);

  function handleInfoClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.closeInfo !== undefined) {
      closeInfoModal();
    }
  }

  infoModal?.addEventListener("click", handleInfoClick);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (imageModal?.classList.contains("open")) {
      closeImageModal();
    }
    if (infoModal?.classList.contains("open")) {
      closeInfoModal();
    }
  });

  function coverImageFor(exibicao) {
    const primeiraObra = exibicao.obras.find((obra) => Boolean(obra.url));
    return (
      primeiraObra?.url ??
      "https://images.unsplash.com/photo-1529421300300-23418098792c?auto=format&fit=crop&w=800&q=80"
    );
  }

  const slides = exibicoes.map((exibicao, index) => {
    const slide = document.createElement("article");
    slide.className = "exibicao-slide";
    slide.style.background = `url(${coverImageFor(exibicao)}) center/cover no-repeat`;

    slide.innerHTML = `
      <div class="slide-content">
        <span>${String(index + 1).padStart(2, "0")}</span>
        <h3>${exibicao.titulo}</h3>
      </div>
    `;

    slide.addEventListener("click", () => showExibicao(exibicao));
    carouselTrack.appendChild(slide);
    return slide;
  });

  const dots = exibicoes.map((_, index) => {
    const dot = document.createElement("div");
    dot.className = "carousel-dot";
    dot.addEventListener("click", () => goToSlide(index));
    carouselIndicators.appendChild(dot);
    return dot;
  });

  function centerCurrentSlide(behavior = "smooth") {
    if (!carouselWindow) return;
    const activeSlide = slides[currentIndex];
    if (!activeSlide) return;
    const offset =
      activeSlide.offsetLeft -
      (carouselWindow.clientWidth - activeSlide.clientWidth) / 2;
    carouselWindow.scrollTo({ left: offset, behavior });
  }

  function updateCarouselUI() {
    slides.forEach((slide, idx) => {
      slide.classList.toggle("active", idx === currentIndex);
    });
    dots.forEach((dot, idx) => {
      dot.classList.toggle("active", idx === currentIndex);
    });

    currentExibicao = exibicoes[currentIndex];
    carouselTitle.textContent = currentExibicao.titulo;
    carouselDescription.textContent = currentExibicao.descricao;
  }

  function goToSlide(index, { behavior } = { behavior: "smooth" }) {
    const total = exibicoes.length;
    currentIndex = ((index % total) + total) % total;
    updateCarouselUI();
    centerCurrentSlide(behavior);
  }

  function nearestSlideFromScroll() {
    if (!carouselWindow) return currentIndex;
    const windowCenter =
      carouselWindow.scrollLeft + carouselWindow.clientWidth / 2;
    let closestIndex = currentIndex;
    let minDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, idx) => {
      const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
      const distance = Math.abs(slideCenter - windowCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = idx;
      }
    });

    return closestIndex;
  }

  function syncCarouselToScroll() {
    const nearestIndex = nearestSlideFromScroll();
    if (nearestIndex !== currentIndex) {
      currentIndex = nearestIndex;
      updateCarouselUI();
    }
  }

  function showExibicao(
    exibicao,
    { updateHistory = true, replace = false } = {},
  ) {
    currentExibicao = exibicao;
    const exibicaoIndex = exibicoes.findIndex((ex) => ex.id === exibicao.id);
    if (exibicaoIndex >= 0) {
      currentIndex = exibicaoIndex;
      updateCarouselUI();
    }
    renderDetails(exibicao);
    if (updateHistory) {
      navigateTo(ROUTES.DETAILS, { exibicaoId: exibicao.id, replace });
    }
  }

  enterGalleryBtn.addEventListener("click", () => {
    goToCarousel();
  });

  if (backToIntroBtn) {
    backToIntroBtn.addEventListener("click", () => {
      goToIntro();
    });
  }

  voltarBtn.addEventListener("click", () => {
    if (navigationIndex > 0) {
      window.history.back();
      return;
    }

    goToCarousel({ replace: true });
  });

  carouselPrev.addEventListener("click", () => {
    goToSlide(currentIndex - 1, { behavior: "smooth" });
  });

  carouselNext.addEventListener("click", () => {
    goToSlide(currentIndex + 1, { behavior: "smooth" });
  });

  viewDetailsBtn.addEventListener("click", () => {
    showExibicao(currentExibicao);
  });

  openInfoBtn?.addEventListener("click", () => {
    updateInfoModalContent(currentExibicao);
    openInfoModal();
  });

  infoAudioBtn?.addEventListener("click", () => toggleInfoAudio());

  window.addEventListener("resize", () => centerCurrentSlide("auto"));

  if (carouselWindow) {
    carouselWindow.addEventListener("scroll", syncCarouselToScroll, {
      passive: true,
    });
  }

  goToSlide(0, { behavior: "auto" });

  const initialRoute = parseHash();

  function applyRoute(route, { fromHistory = false } = {}) {
    switch (route.screen) {
      case ROUTES.CAROUSEL:
        goToCarousel({ updateHistory: !fromHistory });
        break;
      case ROUTES.DETAILS: {
        const exibicao = findExibicaoById(route.exibicaoId) ?? exibicoes[0];
        showExibicao(exibicao, { updateHistory: !fromHistory });
        break;
      }
      case ROUTES.INTRO:
      default:
        goToIntro({ updateHistory: !fromHistory });
        break;
    }
  }

  applyRoute(initialRoute, { fromHistory: true });
  window.history.replaceState(
    {
      screen: initialRoute.screen,
      exibicaoId: initialRoute.exibicaoId ?? null,
      index: navigationIndex,
    },
    "",
    buildHash(initialRoute.screen, initialRoute.exibicaoId ?? null),
  );

  window.addEventListener("popstate", (event) => {
    const state = event.state ?? { screen: ROUTES.INTRO };
    navigationIndex = state.index ?? 0;
    applyRoute(state, { fromHistory: true });
  });
}
