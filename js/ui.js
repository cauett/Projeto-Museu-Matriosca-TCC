export const exibicoes = [
  {
    id: "exibicao1",
    titulo: "Linhas da Vida",
    descricao: "A exposição celebra a potência da arte como expressão sensível e inclusiva.",
    obras: [
      {
        titulo: "Obra 1",
        url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.01.jpeg?v=1744586397132",
        position: { x: 0.25, y: 0.35, z: -0.025 },
        size: { w: 0.45, h: 0.45, d: 0.04 },
        autor: "Ariel Loiola, 52 anos (Invisual)"
      },
      {
        titulo: "Obra 2",
        url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2019.43.42.jpeg?v=1744585878156",
        position: { x: 0.8, y: 0.35, z: -0.025 },
        autor: "Kiko Targino, 54 anos (Invisual)"
      },
      {
        titulo: "Obra 3",
        url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.01%20(1).jpeg?v=1744586388353",
        position: { x: -0.55, y: 0.1, z: -0.025 },
        size: { w: 0.75, h: 0.9, d: 0.04 },
        autor: "Ariel Loiola, 52 anos (Invisual)"
      },
      {
        titulo: "Obra 4",
        url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.01%20(2).jpeg?v=1744586391885",
        position: { x: 0.25, y: -0.35, z: -0.025 },
        autor: "Ariel Loiola, 52 anos (Invisual)"
      },
      {
        titulo: "Obra 5",
        url: "https://cdn.glitch.global/08bbe0af-cfdb-4eda-ab2f-935f0b157c29/WhatsApp%20Image%202025-04-13%20at%2020.19.00.jpeg?v=1744586399142",
        position: { x: 0.8, y: -0.35, z: -0.025 },
        autor: "Kiko Targino, 54 anos (Invisual)"
      }
    ]
  }
];

export function initUI(startCallback, options = {}) {
  const { deviceStatus = {} } = options;
  const {
    mode = "webxr",
    message: deviceMessage = "",
    startLabel: buttonLabel = "Iniciar AR",
  } = deviceStatus;
  const exibicoesContainer = document.getElementById("exibicoes");
  const detalhesEl = document.getElementById("exibicao-detalhes");
  const tituloEl = document.getElementById("exibicao-titulo");
  const descEl = document.getElementById("exibicao-descricao");
  const obrasLista = document.getElementById("obras-lista");
  const voltarBtn = document.getElementById("voltar-btn");
  const startBtn = document.getElementById("start-ar-btn");
  const startWrapper = document.getElementById("start-wrapper");
  const startLabel = document.querySelector(".start-label");

  startBtn.textContent = buttonLabel;
  if (startLabel) {
    startLabel.textContent =
      mode === "fallback"
        ? "Modo alternativo com câmera ativa."
        : "Iniciar experiência de realidade aumentada.";
  }

  exibicoes.forEach((exib) => {
    const card = document.createElement("div");
    card.className = "exibicao-card";
    card.innerHTML = `<h3>${exib.titulo}</h3><p>${exib.descricao}</p>`;
    card.addEventListener("click", () => showExibicao(exib));
    exibicoesContainer.appendChild(card);
  });

  function showExibicao(exibicao) {
    exibicoesContainer.style.display = "none";
    detalhesEl.style.display = "block";
    tituloEl.textContent = exibicao.titulo;
    descEl.textContent = exibicao.descricao;
    obrasLista.innerHTML = "";
    document.getElementById("intro-section").style.display = "none";

    exibicao.obras.forEach((obra) => {
      const div = document.createElement("div");
      div.className = "obra-item";
      div.innerHTML = `
        <img src="${obra.url}" alt="${obra.titulo}" />
        <div><strong>${obra.titulo}</strong></div>
        <div style="font-size: 0.9em; color: #aaa">${obra.autor}</div>
      `;
      obrasLista.appendChild(div);
    });

    startBtn.onclick = mode === "unsupported" ? null : () => startCallback(exibicao);
  }

  voltarBtn.onclick = () => {
    detalhesEl.style.display = "none";
    exibicoesContainer.style.display = "flex";
    document.getElementById("intro-section").style.display = "block";
  };

  if (mode === "unsupported") {
    startBtn.disabled = true;
    startBtn.classList.add("disabled");
    startBtn.setAttribute("aria-disabled", "true");
  } else {
    startBtn.disabled = false;
    startBtn.classList.remove("disabled");
    startBtn.removeAttribute("aria-disabled");
  }

  if (deviceMessage && startWrapper) {
    const info = document.createElement("p");
    info.className = mode === "unsupported" ? "unsupported-message" : "info-message";
    info.textContent = deviceMessage;
    startWrapper.appendChild(info);
  }
}