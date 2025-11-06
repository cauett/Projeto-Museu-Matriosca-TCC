// Tamanho padrão das obras
const DEFAULT_OBRA_SIZE = { w: 0.42, h: 0.42, d: 0.04 };
// Sertão Monumental reduzido (~15%) para não ficar "gigantesco"
const SERTAO_OBRA_SIZE = { w: 0.53, h: 0.34, d: 0.03 };
export const TESOUROS_VIVOS_OBRA_SIZE = { w: 0.18, h: 0.18, d: 0.028 };

function mapObras(
  itens,
  { autor: autorPadrao, size: sizePadrao = DEFAULT_OBRA_SIZE } = {},
) {
  return itens.map(({ arquivo, url, ...obra }) => ({
    ...obra,
    url: url ?? `img/${arquivo}`,
    autor: obra.autor ?? autorPadrao,
    size: obra.size ?? sizePadrao,
  }));
}

// Exposição "Linhas da Vida" (URLs remotas do periodo glitch)
const linhasDaVidaObras = [
  {
    titulo: "Obra 1",
    url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.01.jpeg?v=1744586397132",
    position: { x: 0.25, y: 0.35, z: -0.025 },
    size: { w: 0.45, h: 0.45, d: 0.04 },
    autor: "Ariel Loiola, 52 anos (Invisual)",
  },
  {
    titulo: "Obra 2",
    url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2019.43.42.jpeg?v=1744585878156",
    position: { x: 0.8, y: 0.35, z: -0.025 },
    autor: "Kiko Targino, 54 anos (Invisual)",
  },
  {
    titulo: "Obra 3",
    url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.01%20(1).jpeg?v=1744586388353",
    position: { x: -0.55, y: 0.1, z: -0.025 },
    size: { w: 0.75, h: 0.9, d: 0.04 },
    autor: "Ariel Loiola, 52 anos (Invisual)",
  },
  {
    titulo: "Obra 4",
    url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.01%20(2).jpeg?v=1744586391885",
    position: { x: 0.25, y: -0.35, z: -0.025 },
    autor: "Ariel Loiola, 52 anos (Invisual)",
  },
  {
    titulo: "Obra 5",
    url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.00.jpeg?v=1744586399142",
    position: { x: 0.8, y: -0.35, z: -0.025 },
    autor: "Kiko Targino, 54 anos (Invisual)",
  },
];

// Exposição "Sertão Monumental"
const sertaoAutor = "Acervo Sertão Monumental";
const sertaoMonumentalObras = [
  // === Linha 1 — ORDEM INVERTIDA, MAIS PRÓXIMA AO CENTRO ===
  {
    titulo: "Ponte Metálica de Quixeramobim",
    arquivo: "sertao-monumental/sertao-02.jpeg",
    position: { x: -0.38, y: 0.36, z: -0.025 }, // y antes: 0.50
  },
  {
    titulo: "Geossítio Gruta de São Francisco",
    arquivo: "sertao-monumental/sertao-01.jpeg",
    position: { x: 0.38, y: 0.36, z: -0.025 }, // y antes: 0.50
  },

  // === Linha 2 — CENTRAL ===
  {
    titulo: "Açude Cedro",
    arquivo: "sertao-monumental/sertao-05.jpeg",
    position: { x: -0.78, y: 0.0, z: -0.025 },
  },
  {
    titulo: "Rio Quixeramobim",
    arquivo: "sertao-monumental/sertao-04.jpeg",
    position: { x: -0.26, y: 0.0, z: -0.025 },
  },
  {
    titulo: "Geossítio Gruta do Magé",
    arquivo: "sertao-monumental/sertao-03.jpeg",
    position: { x: 0.26, y: 0.0, z: -0.025 },
  },
  {
    titulo: "Geossítio Gnaisse Milonítico",
    arquivo: "sertao-monumental/sertao-06.jpeg",
    position: { x: 0.78, y: 0.0, z: -0.025 },
  },

  // === Linha 3 — ORDEM INVERTIDA, MAIS PRÓXIMA AO CENTRO ===
  {
    titulo: "Geossítio Pedra do Letreiro",
    arquivo: "sertao-monumental/sertao-10.jpeg",
    position: { x: -0.78, y: -0.36, z: -0.025 }, // y antes: -0.55
  },
  {
    titulo: "Serra do Padre",
    arquivo: "sertao-monumental/sertao-09.jpeg",
    position: { x: -0.26, y: -0.36, z: -0.025 }, // y antes: -0.55
  },
  {
    titulo: "Geossítio Pedra do Cruzeiro",
    arquivo: "sertao-monumental/sertao-08.jpeg",
    position: { x: 0.26, y: -0.36, z: -0.025 }, // y antes: -0.55
  },
  {
    titulo: "Pedra da Gaveta",
    arquivo: "sertao-monumental/sertao-07.jpeg",
    position: { x: 0.78, y: -0.36, z: -0.025 }, // y antes: -0.55
  },
];

// Exposição "Tesouros Vivos do Ceará"
const tesourosVivosAutor = "Otávio Menezes";
const tesourosVivosObras = [
  // === Linha superior ===
  {
    titulo: "Mestre Françuli, Miniaturista",
    arquivo: "tesouros-vivos/tesouro-1.jpeg",
    position: { x: -1.25, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Lucas Evangelista, Cordelista",
    arquivo: "tesouros-vivos/tesouro-2.jpeg",
    position: { x: -1.0, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Stênio Diniz, Xilógrafo",
    arquivo: "tesouros-vivos/tesouro-3.jpeg",
    position: { x: -0.75, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Zé Pio, Bumba-meu-boi",
    arquivo: "tesouros-vivos/tesouro-4.jpeg",
    position: { x: -0.5, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Raimundo Aniceto, Banda Cabaçal",
    arquivo: "tesouros-vivos/tesouro-5.jpeg",
    position: { x: -0.25, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Vitor, Ferreiro",
    arquivo: "tesouros-vivos/tesouro-6.jpeg",
    position: { x: 0, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Piauí, Reisado",
    arquivo: "tesouros-vivos/tesouro-7.jpeg",
    position: { x: 0.25, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Pedro Balaeiro. Trançado em Cipó",
    arquivo: "tesouros-vivos/tesouro-8.jpeg",
    position: { x: 0.5, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Getúlio, Sineiro",
    arquivo: "tesouros-vivos/tesouro-9.jpeg",
    position: { x: 0.75, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Pimenta, Palhaço",
    arquivo: "tesouros-vivos/tesouro-10.jpeg",
    position: { x: 1.0, y: 0.2, z: -0.02 },
  },
  {
    titulo: "Mestre Luis Caboclo, Pajé Tremembé",
    arquivo: "tesouros-vivos/tesouro-11.jpeg",
    position: { x: 1.25, y: 0.2, z: -0.02 },
  },

  // === Linha inferior ===
  {
    titulo: "Mestre Gilberto, Bonequeiro",
    arquivo: "tesouros-vivos/tesouro-12.jpeg",
    position: { x: -1.25, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Antonio Luiz, Reisado de Caretas",
    arquivo: "tesouros-vivos/tesouro-13.jpeg",
    position: { x: -1.0, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Antonio, Luthier-rabeca",
    arquivo: "tesouros-vivos/tesouro-14.jpeg",
    position: { x: -0.75, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Joaquim, Dança de São Gonçalo",
    arquivo: "tesouros-vivos/tesouro-15.jpeg",
    position: { x: -0.5, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Aldenir, Reisado",
    arquivo: "tesouros-vivos/tesouro-16.jpeg",
    position: { x: -0.25, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Espedito Seleiro, Arte em Couro",
    arquivo: "tesouros-vivos/tesouro-17.jpeg",
    position: { x: 0, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Bibi, Escultor",
    arquivo: "tesouros-vivos/tesouro-18.jpeg",
    position: { x: 0.25, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Cirilo, Maneiro Pau",
    arquivo: "tesouros-vivos/tesouro-19.jpeg",
    position: { x: 0.5, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Totonho, Luthier-violino",
    arquivo: "tesouros-vivos/tesouro-20.jpeg",
    position: { x: 0.75, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre João Venâncio, Cacique Tremembé",
    arquivo: "tesouros-vivos/tesouro-21.jpeg",
    position: { x: 1.0, y: -0.15, z: -0.02 },
  },
  {
    titulo: "Mestre Moisés Cardoso, Dança do Côco",
    arquivo: "tesouros-vivos/tesouro-22.jpeg",
    position: { x: 1.25, y: -0.15, z: -0.02 },
  },
];

// Export das exposições (usando o mapper genérico)
export const exibicoes = [
  {
    id: "exibicao1",
    titulo: "Linhas da Vida",
    descricao:
      "A exposição celebra a potência da arte como expressão sensível e inclusiva.",
    obras: mapObras(linhasDaVidaObras, { size: DEFAULT_OBRA_SIZE }),
    quadroTipo: "moldura",
  },
  {
    id: "exibicao2",
    titulo: "Sertão Monumental",
    descricao:
      "A exposição é um esforço conjunto de agentes sociais, educacionais e culturais que buscam promover a difusão e a valorização do patrimônio local.",
    obras: mapObras(sertaoMonumentalObras, {
      autor: sertaoAutor,
      size: SERTAO_OBRA_SIZE,
    }),
    quadroTipo: "fotografia",
  },
  {
    id: "exibicao3",
    titulo: "Tesouros Vivos do Ceará",
    descricao:
      "Reconhecida como uma celebração dos Mestres e Mestras da Cultura Popular, a exposição apresenta as xilogravuras que homenageiam guardiões da memória coletiva cearense.",
    obras: mapObras(tesourosVivosObras, {
      autor: tesourosVivosAutor,
      size: TESOUROS_VIVOS_OBRA_SIZE,
    }),
    quadroTipo: "molduraPreta",
  },
];

// UI
export function initUI(startCallback) {
  const introScreen = document.getElementById("intro-screen");
  const carouselScreen = document.getElementById("carousel-screen");
  const detailsScreen = document.getElementById("details-screen");

  const enterGalleryBtn = document.getElementById("enter-gallery-btn");
  const startArBtn = document.getElementById("start-ar-btn");
  const arStatusEl = document.getElementById("ar-status");

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

  let currentExibicao = exibicoes[0];
  let currentIndex = 0;
  let hasTriggeredAR = false;
  let arSupported = null;

  const screens = [introScreen, carouselScreen, detailsScreen];

  function setActiveScreen(screenEl) {
    screens.forEach((screen) => {
      if (screen === screenEl) {
        screen.classList.add("active");
      } else {
        screen.classList.remove("active");
      }
    });
  }

  function coverImageFor(exibicao) {
    const primeiraObra = exibicao.obras.find((obra) => Boolean(obra.url));
    return primeiraObra?.url ?? "https://images.unsplash.com/photo-1529421300300-23418098792c?auto=format&fit=crop&w=800&q=80";
  }

  const slides = exibicoes.map((exibicao) => {
    const slide = document.createElement("article");
    slide.className = "exibicao-slide";
    slide.innerHTML = `
      <img src="${coverImageFor(exibicao)}" alt="${exibicao.titulo}" />
      <div class="slide-content">
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
    const windowCenter = carouselWindow.scrollLeft + carouselWindow.clientWidth / 2;
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

  function showExibicao(exibicao) {
    currentExibicao = exibicao;
    setActiveScreen(detailsScreen);
    tituloEl.textContent = exibicao.titulo;
    descEl.textContent = exibicao.descricao;
    const heroCover = coverImageFor(exibicao);
    detailsScreen.style.setProperty("--details-cover", `url(${heroCover})`);
    detailsScreen.scrollTo({ top: 0, behavior: "auto" });
    obrasLista.innerHTML = "";
    if (arStatusEl) {
      arStatusEl.textContent = "";
    }
    if (startArBtn) {
      startArBtn.disabled = !arSupported;
    }

    exibicao.obras.forEach((obra) => {
      const div = document.createElement("div");
      div.className = "obra-item";
      div.innerHTML = `
        <img src="${obra.url}" alt="${obra.titulo}" />
        <div class="title">${obra.titulo}</div>
        ${obra.autor ? `<div class="autor">${obra.autor}</div>` : ""}
      `;
      obrasLista.appendChild(div);
    });

    hasTriggeredAR = false;
  }

  enterGalleryBtn.addEventListener("click", () => {
    setActiveScreen(carouselScreen);
    goToSlide(currentIndex, { behavior: "auto" });
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

  window.addEventListener("resize", () => centerCurrentSlide("auto"));

  if (carouselWindow) {
    carouselWindow.addEventListener("scroll", syncCarouselToScroll, {
      passive: true,
    });
  }

  if (startArBtn) {
    startArBtn.addEventListener("click", () => {
      if (arStatusEl) {
        arStatusEl.textContent = "";
      }
      if (typeof startCallback === "function") {
        startCallback(currentExibicao, { alreadyStarted: hasTriggeredAR });
        hasTriggeredAR = true;
      }
    });
  }

  // Estado inicial
  setActiveScreen(introScreen);
  goToSlide(0, { behavior: "auto" });

  function setARAvailability({ supported, message } = { supported: true }) {
    if (typeof supported === "undefined" || supported === null) {
      arSupported = null;
      if (startArBtn) {
        startArBtn.disabled = true;
        startArBtn.textContent = "Verificando dispositivo...";
      }
      if (arStatusEl) {
        arStatusEl.textContent = message ?? "";
      }
      return;
    }

    arSupported = Boolean(supported);
    if (startArBtn) {
      startArBtn.disabled = !arSupported;
      startArBtn.textContent = arSupported
        ? "Iniciar realidade aumentada"
        : "AR indisponível";
    }
    if (arStatusEl) {
      arStatusEl.textContent = message ?? (arSupported
        ? ""
        : "Realidade aumentada não suportada neste dispositivo.");
    }
  }

  function showARUnavailableFeedback(message) {
    if (!arStatusEl) return;
    arStatusEl.textContent =
      message ?? "Não foi possível iniciar a realidade aumentada.";
  }

  return {
    setARAvailability,
    showARUnavailableFeedback,
  };
}
