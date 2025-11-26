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

// Export das exposições (usando o mapper genérico)
export const exibicoes = [
  {
    id: "exibicao1",
    titulo: "Linhas da Vida",
    descricao:
      "A exposição celebra a potência da arte como expressão sensível e inclusiva.",
    obras: mapObras(linhasDaVidaObras, { size: DEFAULT_OBRA_SIZE }),
    quadroTipo: "moldura",
    info: {
      curatorialText: `A linha da vida, na vida, é sinuosa,\nDa partida e emaranhada chegada,\nQuimera criada e felicidade caçada.\nJá a morte... Ah! A morte é teimosa.\n\nE na vida, a morte é misturada,\nCerteza e surpresa sempre em par.\nCria-se ao viver, tanto por igual.\nDe cor e sabor, se bem aproveitada.\n\nTal qual uma poesia em sua tosa,\nIrresoluta em toda transição,\nPorém, elaborada na sua prosa.\n\nE na vida, se não tem novo nada,\nHá, sim, da arte a ser trabalhada\nNo cuidado com linha e no fio na parada.\n\nÉ com essa poesia de Luciano Spagnol — Linha da Vida (2024), Cerrado Goiano — que lhe acolhemos nesta exposição singular a partir das linhas do bordado e do tear, com cores e figurações. Da linha da vida às linhas invisíveis à visão comum. E linhas táteis e sensoriais. E com roteiro poético sensível de acolhimento das pessoas da comunidade invisibilizadas que trazem desse linhas poéticas personalizadas.`,
      metadata: [
        { label: "Curadoria", value: "Dias Brasil" },
        { label: "Texto e poema", value: "Lu Teles — Escritora e dramaturga" },
        {
          label: "Artistas",
          value:
            "António Henrique, Ariel Loiola, Catarina Garcia, Davi Sales, Enzo Gabriel, Franzé Rocha, Gabriel Amorim, Gabriel Medeiros, Gabriel Morais, Geovanna Silva, José Carlos, Kiko Targino, Levi Pimenta, Marianne Bezerra, Maria Eliany, Maria de Nazaré, Rayssa Lima e Vitória Suynara.",
        },
      ],
    },
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
    info: {
      curatorialText:
        "Exposição Sertão Monumental: Valorização Do Patrimônio Cultural E Natural\n\nEsta exposição é um esforço conjunto de agentes sociais, educacionais e culturais que buscam promover a difusão e valorização do patrimônio local, de forma educativa e cultural, apresentando à sociedade do Sertão Central o projeto do Geoparque Sertão Monumental em sua base e dimensões.\n\nO Projeto Geoparque Sertão Monumental surge em 2019 a partir de um relatório técnico realizado pelo Serviço Geológico do Brasil e pesquisadores de outros institutos. O projeto tem como área geográfica seis municípios, sendo Quixeramobim, Quixadá, Ibaretama, Choró, Banabuiú e Ocara. Os objetivos do projeto são: disseminar e preservar o conhecimento geológico, ambiental, histórico e cultural da região; e gerar desenvolvimento socioeconômico com as comunidades locais. Atualmente o Projeto Sertão Monumental encontra-se na fase de elaboração e entrega de dossiê aos avaliadores da UNESCO, a fim de obter o selo de geoparque mundial e integrar a Rede Mundial de Geoparques. Os geoparques são territórios que são distinguidos por áreas de relevância nos quesitos geológicos, arqueológicos, históricos e culturais e tornam-se uma região de promoção do turismo, geração de empregos e desenvolvimento econômico, a partir da valorização desses territórios e da participação social.\n\nO Projeto conta com apoio da comunidade, da sociedade civil, da academia, de instituições públicas, de empresas privadas e do poder público em sua execução. Essa colaboração é imprescindível na construção e fortalecimento das ações e idealização do patrimônio local, valorizando a história e a ciência. As equipes citadas na ficha técnica abaixo representaram diversas instituições das esferas municipal, estadual e federal com apoio decisivo na cooperação e financiamento deste Projeto.\n\nAproveitemos essa oportunidade para valorizarmos o Sertão Central e posicionar nosso território no mapa internacional da ciência, história e cultura.",
      metadata: [
        {
          label: "Créditos institucionais",
          value:
            "Governo do Estado do Ceará — Emanuel de Freitas da Costa (Governador), Jade Afonso Romero (Vice-governadora), Luisa Léa da Arruda Coelho (Secretária da Cultura), Rafael Coelho Felismino (Secretário Executivo da Cultura) e Cecília Torres Fonseca Seara (Executiva de Planejamento e Gestão Interna da Cultura do Ceará). Instituto Dragão do Mar — Rachel Gadelha (Diretora-presidente), Adriana Victorino (Diretora Administrativo Financeira), Sérgio Barroso (Diretor Artístico — interino), Edmilson Lima (Diretor de Infraestrutura), Bete Jaguacybe (Diretora Comercial) e Joaquim Pereira Cordeiro Aderaldo (Outorgante da Casa de Saberes Cego Aderaldo). Serviço Social do Comércio — SESC — Joaquim Cartaxo Filho (Diretor Regional do SESC) e Socorro França (Diretora do Centro de Turismo do SESC).",
        },
        {
          label: "Equipe da exposição",
          value:
            "Rialane Alves (Assistente administrativo); Alexandre Pinheiro (Coordenador de Formação Patrimonial); Kassia Gomes (Assistente Administrativo Financeira); Ronil Nogueira (Assistente de Produção); Yasmim Pinheiro (Assistente Administrativa); Beatriz Neres, Isabella Lima, Lucas Lopes, Mariana Vasconcelos, Natálie Ferreira, Rafaell Penetra, Richély Santos, Talita Alves e Regivane Silva (Monitores); Felipe Lima (Vigia).",
        },
        {
          label: "Ficha técnica",
          value:
            "Realização: Governo do Estado do Ceará por meio da Secretaria de Cultura do Ceará. Parceria: Ministério da Educação; Casa de Saberes Cego Aderaldo; Instituto Dragão do Mar; SESC. Projeto: Geoparque Sertão Monumental. Produção: Instituto Dragão do Mar. Curadoria: Comunidade Científica do Projeto Sertão Monumental. Coordenação: Cibelle Olimpio. Pesquisa: Caroline Rocha e Angélica Viana; Inácio Oliveira; Lorenzo Miraglia; Luiza Alencar; Maiara Mota; Melise Nogueira; Miller Marx. Design: Caroline Rocha e Angélica Viana (Arquiteta, Designer Gráfico).",
        },
      ],
    },
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
    info: {
      curatorialText: `Mestres e Mestras da Cultura do Ceará\n\nReconhecidos como Tesouros Vivos da Cultura, através da Lei Estadual N° 13.842, de 27 de novembro de 2006, os Mestres e Mestras da Cultura do Ceará recebem o apoio para a preservação da memória cultural e dos seus saberes, pelo repasse de recursos para a transmissão às gerações seguintes de seus conhecimentos, técnicas e processos artísticos, de acordo com as regras estabelecidas em seleção pública.\n\nAs entidades públicas, grupos e coletividades detentoras dos conhecimentos e práticas das manifestações populares, cadastradas previamente podem receber o registro com objetivo de preservar e dar continuidade aos seus saberes. O registro também pode ser concedido a grupos e coletivos, quando reconhecidos pelos próprios mestres como fundamentais na preservação das tradições.\n\nEm 2016, durante o X Encontro Mestres do Mundo, na cidade de Limoeiro do Norte, em mais de 10 anos de existência da política pública de registro dos Mestres e Mestras da Cultura do Ceará, foram titulados dez novos mestres da cultura, totalizando 58 Mestres de Cultura do Ceará com registro concedido. A importância dessa política está no reconhecimento das tradições culturais, bem como na valorização da identidade de um povo. É resgatar, valorizar e fomentar a cultura popular através da transferência dos conhecimentos tradicionais, permitindo a continuidade das práticas e saberes imateriais.\n\nExposição de Otávio Menezes\n\nO projeto foi desenvolvido para socializar os conhecimentos e experiências sobre a técnica de xilogravura tridimensional, por meio da arte de Otávio Menezes, Mestre da Cultura do Estado do Ceará desde 2009. O conjunto de obras apresenta o processo de gravação em superfícies e múltiplas camadas, que retratam temas simbólicos e a identidade popular e regional sob uma perspectiva contemporânea de uma tradição viva que dialoga com novas inspirações e visões.`,
      metadata: [
        { label: "Curadoria", value: "Fabiano dos Santos Piubá" },
        { label: "Artista homenageado", value: "Otávio Menezes" },
      ],
    },
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
    info: {
      curatorialText:
        "A exposição Retratos do Voo — Aves Cearenses convida o público a contemplar a beleza e a diversidade das aves que habitam o Ceará. Através de desenhos autorais, a mostra busca despertar o olhar para a riqueza natural do estado e fortalecer a conexão entre arte, a natureza e a cultura local.\n\nO amor pelas aves foi o principal motivador dessa exposição. Cada desenho procura registrar e compartilhar o encanto que essas espécies despertam, destacando as suas características únicas.\n\nMais do que uma celebração visual, Retratos do Voo é um convite à sensibilização ambiental e à valorização da vida que nos rodeia.",
      metadata: [
        { label: "Curadoria", value: "Alefe Queiroz" },
        { label: "Desenhos e textos", value: "Alefe Queiroz" },
        { label: "Museologia", value: "Cauã Maia" },
        { label: "Assistência", value: "Zuleide Oliveira" },
        { label: "Apoio", value: "Equipe do projeto (Gerência do SESC Quixeramobim)" },
      ],
    },
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
    info: {
      curatorialText: `Cotidiano. O que é comum. O que é diário. Dia a dia. O espaço da constituição das subjetividades.\n\nÉ nesse território, em mesa de bar; barulho de secador; no deslizar ou no esbarrar; entre copos, que as subjetividades se fazem. O cotidiano é chão e céu: pode sufocar; pode revelar.\n\nClarice Lispector escreveu: \"O que me mata é o cotidiano. Eu queria só exceções.\" Mas e se o comum for poesia, rara por ruído. Existe alguma luz no extraordinário?\n\nUm vento nos empurra para o rápido, para o raso, para o ruidoso. E a respiração? É preciso desacelerar para adentrar o comum, o simples.\n\nCada fotografia é uma negociação com o tempo: um acordo de paz no presente permanente. Aqui, o cotidiano é ruína de festa, de vento, de antiga seca. A brisa é lúdica. É o bandear gargalhado.\n\nÉ o pedalo e a bicicleta. É o lençol no varal, a rede, o campo, o rio. É o cotidiano em suas inúmeras versões.\n\nEscolha uma: todas merecem ser vistas.`,
      metadata: [
        { label: "Texto curatorial", value: "Fabrícia Teodoro" },
      ],
    },
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
    info: {
      curatorialText:
        "A exposição ‘Quixadá Fantástico’ apresenta leituras surrealistas pintadas em tela e vídeo de paisagens ícones famosas da cidade de Quixadá. As obras resultam de história e memória de Bruno Joe configuradas, com cores vibrantes e de ambiente de sonho e, ao mesmo tempo, construção do imaginário popular a partir dos lugares icônicos da região dos Monólitos.\n\nCom curadoria de Bruno Joe, a mostra traça uma cartografia afetiva de paisagens reais e fantásticas de Quixadá, como a Pedra do Cruzeiro, a Pedra da Galinha Choca, a Pedra do César, a Pedra do Cruzeiro, a cidade de Quixadá, a estátua de Nossa Senhora Imaculada da Saúde, a Capela de São Pedro dos Leões, o Açude do Cedro, a Praça José de Barros, a Praça da Estação, a Catedral, a Margem direita do rio Jaguaribe, a Serra do Estevão e a paisagem do Sertão Central. Representando a realidade da cidade de Quixadá e imaginário, ‘Quixadá Fantástico’ faz alusão a fauna, flora e povo sertanejo, aos mitos e narrativas locais que continuam vivas a partir dos lugares icônicos do sertão.\n\nAs obras refletem a inspiração do real e rompem com a realidade, criando uma sensação de dupla presença, que tanto lembra o cotidiano do sertão como aponta para o universo mágico da terra dos monólitos. Em ‘Quixadá Fantástico’, Bruno Joe transforma a cidade em uma janela para o sonho, convidando o espectador a mergulhar em paisagens que já conhece, mas que se desdobram em possibilidades de uma Quixadá reinventada.",
      metadata: [
        { label: "Curador e artista", value: "Bruno Joe" },
      ],
    },
  },
];

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
  const infoModalTitle = document.getElementById("info-modal-title");
  const infoModalText = document.getElementById("info-modal-text");
  const infoCredits = document.getElementById("info-credits");
  const infoAudioBtn = document.getElementById("info-audio-btn");

  let currentExibicao = exibicoes[0];
  let currentIndex = 0;
  let currentAudioUtterance = null;
  let isAudioPlaying = false;

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

  function goToIntro({ updateHistory = true, replace = false } = {}) {
    setActiveScreen(introScreen);
    if (updateHistory) {
      navigateTo(ROUTES.INTRO, { replace });
    }
  }

  function goToCarousel({ updateHistory = true, replace = false } = {}) {
    setActiveScreen(carouselScreen);
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
    tituloEl.textContent = exibicao.titulo;
    descEl.textContent = exibicao.descricao;
    const heroCover = coverImageFor(exibicao);
    detailsScreen.style.setProperty("--details-cover", `url(${heroCover})`);
    detailsScreen.scrollTo({ top: 0, behavior: "auto" });
    obrasLista.innerHTML = "";
    stopInfoAudio();

    if (openInfoBtn) {
      openInfoBtn.disabled = !Boolean(exibicao.info);
    }

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
    document.body.classList.add("modal-open");
  }

  function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove("open");
    imageModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function handleModalClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.closeModal !== undefined) {
      closeImageModal();
    }
  }

  imageModal?.addEventListener("click", handleModalClick);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && imageModal?.classList.contains("open")) {
      closeImageModal();
    }
  });

  function stopInfoAudio() {
    if (typeof speechSynthesis !== "undefined") {
      speechSynthesis.cancel();
    }
    isAudioPlaying = false;
    currentAudioUtterance = null;
    infoAudioBtn?.classList.remove("playing");
  }

  function buildAudioText(info) {
    if (!info) return "";
    const body = info.curatorialText?.replace(/\s+/g, " ") ?? "";
    const meta = info.metadata
      ?.map((item) => `${item.label}: ${item.value}`)
      .join(". ") ?? "";
    return [body, meta].filter(Boolean).join(". ").trim();
  }

  function renderCredits(metadata = []) {
    if (!infoCredits) return;
    infoCredits.innerHTML = "";
    metadata.forEach((item) => {
      const dt = document.createElement("dt");
      dt.textContent = item.label;
      const dd = document.createElement("dd");
      dd.textContent = item.value;
      infoCredits.append(dt, dd);
    });
  }

  function renderInfoBody(text = "") {
    if (!infoModalText) return;
    infoModalText.innerHTML = "";
    const paragraphs = text
      .split(/\n+/)
      .map((p) => p.trim())
      .filter(Boolean);

    paragraphs.forEach((p) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = p;
      infoModalText.appendChild(paragraph);
    });
  }

  function renderInfoModal(exibicao) {
    if (!infoModal || !infoModalTitle) return;
    const info = exibicao.info;
    if (!info) return;

    stopInfoAudio();
    infoModalTitle.textContent = exibicao.titulo;
    renderInfoBody(info.curatorialText);
    renderCredits(info.metadata);
    infoModal.classList.add("open");
    infoModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function closeInfoModal() {
    if (!infoModal) return;
    stopInfoAudio();
    infoModal.classList.remove("open");
    infoModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  }

  function toggleInfoAudio() {
    const info = currentExibicao.info;
    if (!info || !infoAudioBtn || typeof speechSynthesis === "undefined") return;

    if (isAudioPlaying) {
      stopInfoAudio();
      return;
    }

    const texto = buildAudioText(info);
    if (!texto) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = "pt-BR";
    utterance.rate = 0.96;
    utterance.pitch = 1.05;
    utterance.volume = 0.94;
    const voices = speechSynthesis?.getVoices?.() ?? [];
    const femaleVoice = voices.find((v) =>
      /fem|woman|mulher/i.test(v.name) && v.lang.startsWith("pt"),
    );
    const portugueseVoice = voices.find((v) => v.lang.startsWith("pt"));
    utterance.voice = femaleVoice ?? portugueseVoice ?? null;

    utterance.onend = stopInfoAudio;
    utterance.onerror = stopInfoAudio;

    currentAudioUtterance = utterance;
    isAudioPlaying = true;
    infoAudioBtn.classList.add("playing");
    speechSynthesis.speak(utterance);
  }

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

  window.addEventListener("resize", () => centerCurrentSlide("auto"));

  if (carouselWindow) {
    carouselWindow.addEventListener("scroll", syncCarouselToScroll, {
      passive: true,
    });
  }

  openInfoBtn?.addEventListener("click", () => {
    if (!currentExibicao.info) return;
    renderInfoModal(currentExibicao);
  });

  infoModal?.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.dataset.closeInfo !== undefined) {
      closeInfoModal();
    }
  });

  infoAudioBtn?.addEventListener("click", toggleInfoAudio);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && infoModal?.classList.contains("open")) {
      closeInfoModal();
    }
  });

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
