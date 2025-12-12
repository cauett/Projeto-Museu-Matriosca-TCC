// Tamanho padrão das obras
const DEFAULT_OBRA_SIZE = { w: 0.42, h: 0.42, d: 0.04 };
// Sertão Monumental reduzido (~15%) para não ficar "gigantesco"
const SERTAO_OBRA_SIZE = { w: 0.53, h: 0.34, d: 0.03 };
export const TESOUROS_VIVOS_OBRA_SIZE = { w: 0.18, h: 0.18, d: 0.028 };
const AVES_CEARENSES_OBRA_SIZE = { w: 0.32, h: 0.42, d: 0.038 };
const COTIDIANO_OBRA_SIZE = { w: 0.32, h: 0.42, d: 0.035 };
const COTIDIANO_MIDDLE_SIZE = { w: 0.36, h: 0.47, d: 0.035 };
const QUIXADA_VERTICAL_SIZE = { w: 0.52, h: 0.92, d: 0.04 };
const QUIXADA_HORIZONTAL_SIZE = { w: 1.24, h: 0.74, d: 0.04 };
const ANCESTRALIDADE_SIZE = { w: 0.22, h: 0.22, d: 0.02 };
const BICHA_PASSARIN_MAIN_SIZE = { w: 1.08, h: 0.82, d: 0.02 };
const BICHA_PASSARIN_SMALL_SIZE = { w: 0.48, h: 0.35, d: 0.018 };

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
  // === Linha 1
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

  // === Linha 2
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

  // === Linha 3
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

// Exposição "Retratos do Voo — Aves Cearenses"
const avesCearensesAutor = "Alefe Queiroz";
const avesCearensesObras = [
  // Linha superior (3 quadros)
  {
    titulo: "Sucuruá-de-barriga-vermelha",
    arquivo: "aves-cearenses/ave-1.jpeg",
    position: { x: -0.58, y: 0.54, z: -0.025 },
  },
  {
    titulo: "Pica-pau ocráceo",
    arquivo: "aves-cearenses/ave-2.jpeg",
    position: { x: 0, y: 0.54, z: -0.025 },
  },
  {
    titulo: "Carcará",
    arquivo: "aves-cearenses/ave-3.jpeg",
    position: { x: 0.58, y: 0.54, z: -0.025 },
  },

  // Linha central (5 quadros)
  {
    titulo: "Rabo-branco-rubro",
    arquivo: "aves-cearenses/ave-4.jpeg",
    position: { x: -0.96, y: 0, z: -0.025 },
  },
  {
    titulo: "Chorozinho-da-caatinga",
    arquivo: "aves-cearenses/ave-5.jpeg",
    position: { x: -0.48, y: 0, z: -0.025 },
  },
  {
    titulo: "Urutau",
    arquivo: "aves-cearenses/ave-6.jpeg",
    position: { x: 0, y: 0, z: -0.025 },
  },
  {
    titulo: "Pompeu",
    arquivo: "aves-cearenses/ave-7.jpeg",
    position: { x: 0.48, y: 0, z: -0.025 },
  },
  {
    titulo: "Cara-suja",
    arquivo: "aves-cearenses/ave-8.jpeg",
    position: { x: 0.96, y: 0, z: -0.025 },
  },

  // Linha inferior (2 quadros)
  {
    titulo: "Picapauzinho-da-caatinga",
    arquivo: "aves-cearenses/ave-9.jpeg",
    position: { x: -0.48, y: -0.54, z: -0.025 },
  },
  {
    titulo: "Bacurauzinho-da-caatinga",
    arquivo: "aves-cearenses/ave-10.jpeg",
    position: { x: 0.48, y: -0.54, z: -0.025 },
  },
];

// Exposição "Cotidiano"
const cotidianoAutor = "Fábricia Teodoro";
const cotidianoObras = [
  // Linha superior
  {
    titulo: "Cotidiano 1",
    arquivo: "cotidiano/cotidiano-1.jpeg",
    position: { x: -0.44, y: 0.5, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
  },
  {
    titulo: "Cotidiano 2",
    arquivo: "cotidiano/cotidiano-2.jpeg",
    position: { x: 0, y: 0.5, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
  },
  {
    titulo: "Cotidiano 3",
    arquivo: "cotidiano/cotidiano-3.jpeg",
    position: { x: 0.44, y: 0.5, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
  },

  // Linha do meio
  {
    titulo: "Cotidiano 4",
    arquivo: "cotidiano/cotidiano-4.jpeg",
    position: { x: -0.44, y: 0, z: -0.025 },
    size: COTIDIANO_MIDDLE_SIZE,
  },
  {
    titulo: "Cotidiano 5",
    arquivo: "cotidiano/cotidiano-5.jpeg",
    position: { x: 0, y: 0, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
  },
  {
    titulo: "Cotidiano 6",
    arquivo: "cotidiano/cotidiano-6.jpeg",
    position: { x: 0.44, y: 0, z: -0.025 },
    size: COTIDIANO_MIDDLE_SIZE,
  },

  // Linha inferior
  {
    titulo: "Cotidiano 7",
    arquivo: "cotidiano/cotidiano-7.jpeg",
    position: { x: -0.44, y: -0.5, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
  },
  {
    titulo: "Cotidiano 8",
    arquivo: "cotidiano/cotidiano-8.jpeg",
    position: { x: 0, y: -0.5, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
  },
  {
    titulo: "Cotidiano 9",
    arquivo: "cotidiano/cotidiano-9.jpeg",
    position: { x: 0.44, y: -0.5, z: -0.025 },
    size: COTIDIANO_OBRA_SIZE,
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

// Exposição "Quixadá Fantástico"
const quixadaFantasticoAutor = "Bruno Joe";
const quixadaFantasticoObras = [
  {
    titulo: "O Tempo (Pedra do Cruzeiro)",
    arquivo: "quixas-fantastico/fantasia-1.jpeg",
    autor: quixadaFantasticoAutor,
    position: { x: -0.98, y: 0.08, z: -0.025 },
    size: QUIXADA_VERTICAL_SIZE,
  },
  {
    titulo: "A Noite (Cedro Fantástico)",
    arquivo: "quixas-fantastico/fantasia-2.jpeg",
    autor: quixadaFantasticoAutor,
    position: { x: 0, y: 0.08, z: -0.025 },
    size: QUIXADA_HORIZONTAL_SIZE,
  },
  {
    titulo: "O Des-envolvimento (Pedra da Cabeça do Leão)",
    arquivo: "quixas-fantastico/fantasia-3.jpeg",
    autor: quixadaFantasticoAutor,
    position: { x: 0.98, y: 0.08, z: -0.025 },
    size: QUIXADA_VERTICAL_SIZE,
  },
];

const ancestralidadeAutores = {
  1: "Maria Alice",
  2: "Pedro Matheus",
  3: "Maria Alice",
  4: "Adriana",
  5: "Pedro Torres",
  6: "Maria Eliane",
  7: "Paulo Roberto",
  8: "Adriana",
  9: "Richely",
  10: "Pedro Torres",
  11: "Paulo Roberto",
  12: "Richely",
  13: "Adriana",
  14: "Marco Martins",
  15: "Pedro Matheus",
  16: "Maria Alice",
  17: "Adriana",
  18: "Marco Martins",
  19: "Maria Eliane",
  20: "Richely",
  21: "Maria Alice",
  22: "Glimara Texeira",
  23: "Marco Martins",
};

const ancestralidadeObras = [
  // coluna 1 (1)
  {
    titulo: "Xilogravura 1",
    arquivo: "ancestralidade/obra-1.jpeg",
    autor: ancestralidadeAutores[1],
    position: { x: 1.12, y: 0.0, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 2 (2,3,4) – coluna "alta"
  {
    titulo: "Xilogravura 2",
    arquivo: "ancestralidade/obra-2.jpeg",
    autor: ancestralidadeAutores[2],
    position: { x: 0.84, y: 0.28, z: -0.02 }, // acima do 3
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 3",
    arquivo: "ancestralidade/obra-3.jpeg",
    autor: ancestralidadeAutores[3],
    position: { x: 0.84, y: 0.0, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 4",
    arquivo: "ancestralidade/obra-4.jpeg",
    autor: ancestralidadeAutores[4],
    position: { x: 0.84, y: -0.28, z: -0.02 }, // abaixo do 3
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 3 (5,6,7) – coluna "baixa"
  {
    titulo: "Xilogravura 5",
    arquivo: "ancestralidade/obra-5.jpeg",
    autor: ancestralidadeAutores[5],
    position: { x: 0.56, y: 0.2, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 6",
    arquivo: "ancestralidade/obra-6.jpeg",
    autor: ancestralidadeAutores[6],
    position: { x: 0.56, y: -0.08, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 7",
    arquivo: "ancestralidade/obra-7.jpeg",
    autor: ancestralidadeAutores[7],
    position: { x: 0.56, y: -0.36, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 4 (8,9,10) – coluna "alta"
  {
    titulo: "Xilogravura 8",
    arquivo: "ancestralidade/obra-8.jpeg",
    autor: ancestralidadeAutores[8],
    position: { x: 0.28, y: 0.28, z: -0.02 }, // acima do 9
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 9",
    arquivo: "ancestralidade/obra-9.jpeg",
    autor: ancestralidadeAutores[9],
    position: { x: 0.28, y: 0.0, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 10",
    arquivo: "ancestralidade/obra-10.jpeg",
    autor: ancestralidadeAutores[10],
    position: { x: 0.28, y: -0.28, z: -0.02 }, // abaixo do 9
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 5 (11,12,13) – coluna "baixa"
  {
    titulo: "Xilogravura 11",
    arquivo: "ancestralidade/obra-11.jpeg",
    autor: ancestralidadeAutores[11],
    position: { x: 0.0, y: 0.2, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 12",
    arquivo: "ancestralidade/obra-12.jpeg",
    autor: ancestralidadeAutores[12],
    position: { x: 0.0, y: -0.08, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 13",
    arquivo: "ancestralidade/obra-13.jpeg",
    autor: ancestralidadeAutores[13],
    position: { x: 0.0, y: -0.36, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 6 (14,15,16) – coluna "alta"
  {
    titulo: "Xilogravura 14",
    arquivo: "ancestralidade/obra-14.jpeg",
    autor: ancestralidadeAutores[14],
    position: { x: -0.28, y: 0.28, z: -0.02 }, // acima do 15
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 15",
    arquivo: "ancestralidade/obra-15.jpeg",
    autor: ancestralidadeAutores[15],
    position: { x: -0.28, y: 0.0, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 16",
    arquivo: "ancestralidade/obra-16.jpeg",
    autor: ancestralidadeAutores[16],
    position: { x: -0.28, y: -0.28, z: -0.02 }, // abaixo do 15
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 7 (17,18,19) – coluna "baixa"
  {
    titulo: "Xilogravura 17",
    arquivo: "ancestralidade/obra-17.jpeg",
    autor: ancestralidadeAutores[17],
    position: { x: -0.56, y: 0.2, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 18",
    arquivo: "ancestralidade/obra-18.jpeg",
    autor: ancestralidadeAutores[18],
    position: { x: -0.56, y: -0.08, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 19",
    arquivo: "ancestralidade/obra-19.jpeg",
    autor: ancestralidadeAutores[19],
    position: { x: -0.56, y: -0.36, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 8 (20,21,22) – coluna "alta"
  {
    titulo: "Xilogravura 20",
    arquivo: "ancestralidade/obra-20.jpeg",
    autor: ancestralidadeAutores[20],
    position: { x: -0.84, y: 0.28, z: -0.02 }, // acima do 21
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 21",
    arquivo: "ancestralidade/obra-21.jpeg",
    autor: ancestralidadeAutores[21],
    position: { x: -0.84, y: 0.0, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
  {
    titulo: "Xilogravura 22",
    arquivo: "ancestralidade/obra-22.jpeg",
    autor: ancestralidadeAutores[22],
    position: { x: -0.84, y: -0.28, z: -0.02 }, // abaixo do 21
    size: ANCESTRALIDADE_SIZE,
  },

  // coluna 9 (23)
  {
    titulo: "Xilogravura 23",
    arquivo: "ancestralidade/obra-23.jpeg",
    autor: ancestralidadeAutores[23],
    position: { x: -1.12, y: 0.0, z: -0.02 },
    size: ANCESTRALIDADE_SIZE,
  },
];

const bichaPassarinObras = [
  {
    titulo: "Passarin 1",
    arquivo: "bicha-passarin/passarin-1.jpeg",
    autor: "Raul Plassman",
    position: { x: 0, y: 0.42, z: -0.02 },
    size: BICHA_PASSARIN_MAIN_SIZE,
  },
  {
    titulo: "Passarin 2",
    arquivo: "bicha-passarin/passarin-2.jpeg",
    autor: "Raul Plassman",
    position: { x: -0.62, y: -0.34, z: -0.02 },
    size: BICHA_PASSARIN_SMALL_SIZE,
  },
  {
    titulo: "Passarin 3",
    arquivo: "bicha-passarin/passarin-3.jpeg",
    autor: "Raul Plassman",
    position: { x: 0, y: -0.34, z: -0.02 },
    size: BICHA_PASSARIN_SMALL_SIZE,
  },
  {
    titulo: "Passarin 4",
    arquivo: "bicha-passarin/passarin-4.jpeg",
    autor: "Raul Plassman",
    position: { x: 0.62, y: -0.34, z: -0.02 },
    size: BICHA_PASSARIN_SMALL_SIZE,
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
  {
    id: "exibicao4",
    titulo: "Retratos do Voo",
    descricao:
      "Mostra que convida o público a contemplar a beleza e a diversidade das aves que habitam o Ceará, celebrando o amor pela avifauna e o cuidado com a natureza local.",
    obras: mapObras(avesCearensesObras, {
      autor: avesCearensesAutor,
      size: AVES_CEARENSES_OBRA_SIZE,
    }),
    quadroTipo: "molduraMadeira",
    autoSpread: false,
  },
  {
    id: "exibicao5",
    titulo: "Cotidiano",
    descricao:
      "Sequência de fotografias que revela, com delicadeza, como o comum guarda camadas de afeto e memória.",
    obras: mapObras(cotidianoObras, {
      autor: cotidianoAutor,
      size: COTIDIANO_OBRA_SIZE,
    }),
    quadroTipo: "molduraPreta",
  },
  {
    id: "exibicao6",
    titulo: "Quixadá Fantástico",
    descricao:
      "Cartografia afetiva e surreal de paisagens icônicas de Quixadá, pintadas com cores vibrantes que misturam mito e sertão.",
    obras: mapObras(quixadaFantasticoObras, {
      autor: quixadaFantasticoAutor,
    }),
    quadroTipo: "molduraMadeira",
    autoSpread: false,
  },
  {
    id: "exibicao7",
    titulo: "Ancestralidade, Resistência e Transmissão",
    descricao:
      "Xilogravuras que contam a trajetória do Mestre Stênio Diniz, em um bloco compacto com alturas irregulares, rememorando raízes, encontros e legados.",
    obras: mapObras(ancestralidadeObras, { size: ANCESTRALIDADE_SIZE }),
    quadroTipo: "molduraMadeira",
    autoSpread: false,
  },
  {
    id: "exibicao8",
    titulo: "Bicha Passarin — um voo de Raul Plassman e Lola Green",
    descricao:
      "Encontro entre performance, fotografia e afeto celebrando 10 anos de Lola Green, com curadoria de Raul Plassman e Beto Skeff.",
    obras: mapObras(bichaPassarinObras, { autor: "Raul Plassman" }),
    quadroTipo: "tecido",
    autoSpread: false,
  },
];

const exibicoesInfo = {
  exibicao1: {
    curatorialText:
      "A linha da vida, na vida, é sinuosa,\nDa partida à emaranhada chegada,\nQuimera criada e felicidade caçada.\nJá a morte... Ah! A morte é teimosa.\n\nÉ mecha, aro e sorte misturada,\nCerteza e surpresa bem plantadas,\nMas tudo com uma pitada furiosa.\nDe cor e sabor, se bem aproveitada.\n\nTal qual uma poesia em sua tosa,\nIrresoluta e linda na estrada,\nPorém, elaborada na sua prosa.\n\nE no talo bem não tem nada,\nHá sede, entrada, espinho e rosa.\nE a vida, como estrada não fica parada...\n\nÉ com essa poesia de Luciano Spagnol — Linha da Vida (2016, Cerrado Goiano) — que abrimos nossa exposição. Cada pessoa, com um ponto de partida, se intercruza, vira trama, um traço e outro. Em Linha da Vida, a técnica de artesanato é feita com linha e agulha. Assim, vão construindo em cores cada pedacinho de suas vidas por meio dessa linhas poéticas imaginárias.",
    credits: [
      {
        label: "Curadoria",
        value: "Dias Brasil",
      },
      {
        label: "Poema de referência",
        value: "Luciano Spagnol — Linha da Vida (2016, Cerrado Goiano)",
      },
      {
        label: "Artistas",
        value:
          "António Henrique, Ariel Loiola, Catarina Garcia, Davi Sales, Enzo Gabriel, Franzé Rocha, Gabriel Amorim, Gabriel Medeiros, Gabriel Morais, Geovanna Silva, José Carlos, Kiko Targino, Levi Pimenta, Marianne Bezerra, Maria Eliany, Maria de Nazaré, Rayssa Lima, Vitória Suynara",
      },
    ],
  },
  exibicao2: {
    curatorialText:
      "Esta exposição é um esforço conjunto de agentes sociais, educacionais e culturais que buscam promover a difusão e valorização do patrimônio local, de forma educativa e cultural, apresentando à sociedade do Sertão Central o projeto do Geoparque Sertão Monumental em suas múltiplas dimensões.\n\nO Projeto Geoparque Sertão Monumental surge em 2019 a partir de um relatório técnico realizado pelo Serviço Geológico do Brasil e pesquisadores de outros institutos. O projeto tem como geossítios iniciais, segundo Furtado et al., 2021, o açude do Cedro, a Pedra do Cruzeiro, os Monólitos e o Quixadá Gnaisse, situados no município de Quixadá. As ações são orientadas pelos aspectos geológicos, biológicos, turísticos e culturais na escala regional. Atualmente o Projeto encontra-se em sua fase preparatória, a partir do planejamento e a elaboração do Plano de Gestão, bem como a execução de projetos e eventos de sensibilização junto às comunidades locais e aos governos municipal e estadual. Os geoparques servem como ferramentas de desenvolvimento econômico sustentável. A principal característica é a unicidade geológica, mas a estrutura geoparque tem como foco conservar e elevar a valorização da comunidade local por meio de experiências imersivas e educativas que conciliam o trinômio do desenvolvimento sustentável.\n\nO Geoparque tem como objetivo a conservação dos geossítios e o estímulo aos seus valores ambientais, científicos, culturais e turísticos contribuindo com a estratégia de desenvolvimento sustentável e conservação do território a partir das demandas das comunidades das localidades. A Geodiversidade faz parte da identidade do Sertão Central, assim como nossa forma de viver, sentir e ser. O projeto visa ampliar a divulgação e o conhecimento dos geossítios, considerando suas contribuições às teorias e estudos sobre a formação da Terra, como também ações educacionais, culturais e atividades turísticas, e ainda à atividade econômica da região trazendo mais emprego e renda para as comunidades locais.",
    credits: [
      {
        label: "Curadoria e pesquisa",
        value: "Yasmin Malheiros",
      },
      {
        label: "Assistência de curadoria",
        value: "Isabella Lima, Lucas Lopes, Beatriz Neres, Beatriz Nascimento",
      },
      {
        label: "Produção",
        value:
          "Priscila Lima, Raiane Alves, Richely Santos, Tayná Maia, Vinicius Oliveira",
      },
      {
        label: "Roteiro, gravação e edição do áudio guia",
        value: "Rayanne Sobrinho",
      },
      {
        label: "Realização e apoio",
        value:
          "Governo do Estado do Ceará, Instituto Dragão do Mar, Centro Cultural Banco do Nordeste, Serviço Social do Comércio (SESC), Governo Federal — Ministério da Cultura",
      },
    ],
  },
  exibicao3: {
    curatorialText:
      "Reconhecidos como Tesouros Vivos da Cultura, através da Lei Estadual N° 13.842, de 27 de novembro de 2006, os Mestres e Mestras da Cultura do Ceará recebem o apoio para a preservação da memória cultural do Estado, promovendo a transmissão às gerações futuras dos conhecimentos dos seus saberes orais ou escritos. A Lei reconhece aqueles grupos e coletividades detentores de manifestação cultural que os nomina como patrimônio imaterial e traz como forma de ação estabelecida a transmissão oral e prática, o registro e os processos ao serem desenvolvidos para sua perpetuação.\n\nEm 2016, durante o X Encontro Mestres do Mundo, na cidade de Limoeiro do Norte, em sua décima edição e o único encontro dessa natureza no Brasil, foi lançado o selo do saber e do fazer com a produção de uma série de xilogravuras intitulada Noutro Saber em Cultura Popular pela Universidade Estadual do Ceará (UECE).\n\nA exposição apresenta 58 xilogravuras de artistas, pesquisadores e educadores de diversas áreas, inspiradas nas histórias dos Mestres e Mestras da Cultura do Ceará, que buscam trazer à tona os conhecimentos e saberes para a preservação das tradições. Cada xilogravura foi pensada e elaborada pelos artistas, com os recursos de suas pesquisas, experiências e vivências na cultura popular.\n\nExposição de Otávio Menezes\nArtista, ilustrador, designer gráfico e pesquisador dos Mestres e Mestras da Cultura do Ceará. Em 2025, lançou o livro Mestres Mestres e Mestras da Cultura Popular Cearense, que reúne, em artes e letras, histórias, registros e o fazer dos 58 Mestres e Mestras reconhecidos pelo Governo do Estado do Ceará e pela Secretaria da Cultura do Estado do Ceará (Secult Ceará).",
    credits: [
      {
        label: "Exposição",
        value: "Otávio Menezes",
      },
      {
        label: "Texto curatorial",
        value: "Fabiano dos Santos Piúba",
      },
      {
        label: "Homenagem",
        value:
          "58 Mestres e Mestras da Cultura do Ceará reconhecidos pela Lei Estadual Nº 13.842/2006",
      },
    ],
  },
  exibicao4: {
    curatorialText:
      "A exibição convida o público a contemplar a beleza e a diversidade das aves que habitam o Ceará. Através de desenhos autorais, a mostra busca despertar o olhar para a riqueza natural do estado e fortalecer a conexão entre a arte, a natureza e a cultura local.\n\nO amor pelas aves foi o principal motivador dessa exposição. Cada desenho procura registrar e compartilhar o encanto que essas espécies despertam, destacando as suas características únicas.\n\nMais do que uma celebração visual, Retratos do Voo é um convite à sensibilização ambiental e à valorização da vida que nos rodeia.",
    credits: [
      {
        label: "Curadoria",
        value: "Alefe Queiroz",
      },
      {
        label: "Desenho, pintura e música",
        value: "Alefe Queiroz",
      },
      {
        label: "Assistência",
        value: "Priscila Camelo",
      },
      {
        label: "Voz",
        value: "Alefe Queiroz",
      },
      {
        label: "Redes",
        value: "@alefequeiroz, @alefequeiroz2",
      },
      {
        label: "Apoio",
        value:
          "Universidade Federal do Ceará — projeto aprovado na IV Chamada Pública de Fomento à Cultura do Cariri (Temporada Sesc-CE Central 2025/2026)",
      },
    ],
  },
  exibicao5: {
    curatorialText:
      "O que é comum. O que é diário. Dia a dia. O espaço da constituição das subjetividades.\n\nÉ nesse território, entre a mesa de bar; o silêncio do taró; o ruído da chuva; onde as subjetividades se fazem presente. O cotidiano é chão e céu; pode sufocar; pode revelar.\n\nClarice Lispector escreveu: “O que me mata é o cotidiano. Eu queria só exceções.” Mas e se o comum também puder nomear o extraordinário?\n\nOs sentidos do que nos empurra para o rápido, para o raso, para o ruidoso. Esteja atento a isso: estarei te observando de qualquer lugar. Respirar fundo. Desacelerar. O banal carrega a beleza.\n\nCada fotografia é uma negociação com o tempo: um segundo em que a memória é presente. Aqui, o chão é espaço de afeto e recomeço. Onde as pessoas estão, a chuva também chega. Todos os mundos agora são possíveis.\n\nSe um rio pudesse se manter no mesmo lugar, eu iria esperar a onda novamente. Vejo-me e continuo.\n\nEsse é o cotidiano que me atravessa. Espero que também atravesse você. E todos merecemos viver as reversões, revoluções.\n\nFabrícia Teodoro artista.",
    credits: [
      {
        label: "Criação e texto",
        value: "Fabrícia Teodoro",
      },
    ],
  },
  exibicao6: {
    curatorialText:
      "Apresenta leituras surrealistas pintadas em tela e vídeo de paisagens e lendas famosas da cidade de Quixadá. As novas obras do artista Bruno Joe mostram uma cartografia afetiva e, ao mesmo tempo, um pouco surreal dos lugares em Quixadá que influenciaram o imaginário popular e a identidade da região, como os monólitos, açude do Cedro, Pedra do Cruzeiro, o crato e o Santuário de Nossa Senhora da Imaculada Rainha do Sertão, o Santuário de Nossa Senhora do Rosário e a Pedra do Cruzeiro. As obras evidenciam a dimensão fantasmagórica que é latente do imaginário popular, e também transmitem a sensação de estar no interior através de recortes das cidades e pontos históricos que foram símbolos dessas histórias.\n\nNo cenário imaginário do real e quem nos move são artistas que trazem as luzes mais fantasiosas da nossa região para a vida visual e que imaginam mundos e universos paralelos, com a tropicalidade das paisagens e a diversidade de cores, diversidade étnica e meio ambiente e a cidade onde moramos.\n\nA exposição traz a imaginação do real e promove uma viagem para o mundo do surreal, com ilustrações que criam um universo fantástico e lúdico que perpassa a vivência social do Sertão Central. A mostra “Quixadá Fantástico” dispõe de obras em tela, mas o foco das obras está no audiovisual, narrando histórias e lendas cearenses, que imaginam o futuro e ressignificam o passado. A mostra apresenta um recorte da nossa região que atravessa diversas memórias afetivas.\n\nBruno Joe\nCurador.",
    credits: [
      {
        label: "Curadoria e obras",
        value: "Bruno Joe",
      },
      {
        label: "Realização",
        value:
          "Casa de Saberes Cego Aderaldo, Instituto Dragão do Mar, Governo do Estado do Ceará",
      },
    ],
  },
  exibicao7: {
    curatorialText:
      'A exposição "Ancestralidade, Resistência e Transmissão: A saga do Mestre Stênio Diniz" convida o olhar a mergulhar na xilogravura como memória viva, abrindo caminhos para celebrar as raízes, os frutos e os futuros que elas germinam. Desde a segunda metade do século XIX, a gravura em madeira acompanhou a poesia dos folhetos no Nordeste. Foi a xilogravura dos cordéis que inspirou Mestre Stênio a se tornar gravador ainda nos mercados e feiras, quando comprava e lia cordéis no Madureira, no Rio de Janeiro.\n\nA segunda sala revela o período de formação e as obras produzidas no Quixadá, onde a saga do mestre se conecta às memórias coletivas e às experimentações de uma juventude que resiste, cria e repassa saberes. A mostra reúne xilogravuras de artistas que partilham da caminhada de Stênio Diniz, mantendo viva a tradição ao mesmo tempo em que assumem diferentes gestos e perspectivas para retratar a comunidade, os sonhos e as lutas do sertão.',
    credits: [
      {
        label: "Curadoria",
        value: "Raianne Alves",
      },
      {
        label: "Assistência de curadoria",
        value: "Richely Santos",
      },
      {
        label: "Curadoria educativa",
        value: "Raiane Alves",
      },
      {
        label: "Montagem de exposição",
        value: "Equipe Casa de Saberes Cego Aderaldo",
      },
      {
        label: "Design gráfico e comunicação",
        value: "Casa de Saberes Cego Aderaldo",
      },
    ],
  },
  exibicao8: {
    curatorialText:
      "🕊️ Exposição “Bicha Passarim — um voo de Raul Plassman e Lola Green”, com curadoria de Raul Plassman e Beto Skeff.\n\nUm encontro entre performance, fotografia e afeto.\nNesta mostra, o artista Raul Plassman celebra os 10 anos de Lola Green, criação mística de Emanuel Martins, em uma travessia poética entre o interior e a cidade, entre o sonho e o chão.\n\nAs imagens, analógicas, instantâneas e digitais, revelam o aconchego da casa de vó, o território das memórias e a liberdade dos voos singulares que também são coletivos. Um convite para sentir, ver e voar junto. 💫",
    credits: [
      {
        label: "Curadoria",
        value: "Raul Plassman e Beto Skeff",
      },
      {
        label: "Fotografia e performance",
        value: "Raul Plassman e Lola Green",
      },
      {
        label: "Criação de Lola Green",
        value: "Emanuel Martins",
      },
    ],
  },
};

// UI
export function initUI(startCallback) {
  const uiContainer = document.getElementById("ui");
  const galleryRoot = document.getElementById("gallery-ui");
  const introScreen = document.getElementById("intro-screen");
  const carouselScreen = document.getElementById("carousel-screen");
  const detailsScreen = document.getElementById("details-screen");

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
