// Tamanho padrão das obras
const DEFAULT_OBRA_SIZE = { w: 0.42, h: 0.42, d: 0.04 };
const SERTAO_OBRA_SIZE = { w: 0.64, h: 0.45, d: 0.04 };

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
  {
    titulo: "Geossítio Gruta de São Francisco",
    arquivo: "sertao-monumental/sertao-01.jpeg",
    position: { x: 0.8, y: 0.55, z: -0.025 },
  },
  {
    titulo: "Ponte Metálica de Quixeramobim",
    arquivo: "sertao-monumental/sertao-02.jpeg",
    position: { x: 0, y: 0.55, z: -0.025 },
  },
  {
    titulo: "Geossítio Gruta do Magé",
    arquivo: "sertao-monumental/sertao-03.jpeg",
    position: { x: -0.8, y: 0.55, z: -0.025 },
  },
  {
    titulo: "Rio Quixeramobim",
    arquivo: "sertao-monumental/sertao-04.jpeg",
    position: { x: 0.45, y: 0.15, z: -0.025 },
  },
  {
    titulo: "Açude Cedro",
    arquivo: "sertao-monumental/sertao-05.jpeg",
    position: { x: -0.45, y: 0.15, z: -0.025 },
  },
  {
    titulo: "Geossítio Gnaisse Milonítico",
    arquivo: "sertao-monumental/sertao-06.jpeg",
    position: { x: 1, y: -0.4, z: -0.025 },
  },
  {
    titulo: "Pedra da Gaveta",
    arquivo: "sertao-monumental/sertao-07.jpeg",
    position: { x: 0.5, y: -0.4, z: -0.025 },
  },
  {
    titulo: "Geossítio Pedra do Cruzeiro",
    arquivo: "sertao-monumental/sertao-08.jpeg",
    position: { x: 0, y: -0.4, z: -0.025 },
  },
  {
    titulo: "Serra do Padre",
    arquivo: "sertao-monumental/sertao-09.jpeg",
    position: { x: -0.5, y: -0.4, z: -0.025 },
  },
  {
    titulo: "Geossítio Pedra do Letreiro",
    arquivo: "sertao-monumental/sertao-10.jpeg",
    position: { x: -1, y: -0.4, z: -0.025 },
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
  },
];

// UI
export function initUI(startCallback) {
  const exibicoesContainer = document.getElementById("exibicoes");
  const detalhesEl = document.getElementById("exibicao-detalhes");
  const tituloEl = document.getElementById("exibicao-titulo");
  const descEl = document.getElementById("exibicao-descricao");
  const obrasLista = document.getElementById("obras-lista");
  const voltarBtn = document.getElementById("voltar-btn");
  const startBtn = document.getElementById("start-ar-btn");

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
        <div class="title">${obra.titulo}</div>
        ${obra.autor ? `<div class="autor">${obra.autor}</div>` : ""}
      `;
      obrasLista.appendChild(div);
    });

    startBtn.onclick = () => startCallback(exibicao);
  }

  voltarBtn.onclick = () => {
    detalhesEl.style.display = "none";
    exibicoesContainer.style.display = "flex";
    document.getElementById("intro-section").style.display = "block";
  };
}
