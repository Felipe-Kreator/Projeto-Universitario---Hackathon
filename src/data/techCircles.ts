export type Area = {
  id: string;
  nome: string;
  subareas: string[];
};

export const areas: Area[] = [
  {
    id: "computacao",
    nome: "Ciência da Computação",
    subareas: ["Inteligência Artificial", "Engenharia de Software", "Redes e Segurança", "Ciência de Dados"],
  },
  {
    id: "ads",
    nome: "Análise e Desenvolvimento de Sistemas",
    subareas: ["Desenvolvimento Web", "Banco de Dados", "DevOps", "Experiência do Usuário"],
  },
  {
    id: "engenharias",
    nome: "Engenharias",
    subareas: ["Automação", "Materiais", "Energia"],
  },
  {
    id: "saude",
    nome: "Saúde",
    subareas: ["Saúde Digital", "Enfermagem", "Biomedicina"],
  },
  {
    id: "humanas",
    nome: "Humanas e Sociais",
    subareas: ["Educação", "Direito Digital", "Administração"],
  },
];

export type Pessoa = {
  id: string;
  nome: string;
  papel: "Estudante" | "Orientador" | "Conselho";
  curso: string;
  emailProfissional: string;
  lattes: string;
  areas: string[];
  subareas: string[];
  bio: string;
  iniciais: string;
};

export const pessoas: Pessoa[] = [
  {
    id: "ana-ribeiro",
    nome: "Ana Ribeiro",
    papel: "Estudante",
    curso: "Ciência da Computação — 6º semestre",
    emailProfissional: "ana.ribeiro@brazcubas.edu.br",
    lattes: "http://lattes.cnpq.br/0000000000000001",
    areas: ["Ciência da Computação"],
    subareas: ["Inteligência Artificial", "Ciência de Dados"],
    bio: "Bolsista PIBIC estudando modelos de linguagem aplicados ao atendimento estudantil.",
    iniciais: "AR",
  },
  {
    id: "marcos-tavares",
    nome: "Prof. Dr. Marcos Tavares",
    papel: "Orientador",
    curso: "Docente — Computação e Engenharias",
    emailProfissional: "marcos.tavares@brazcubas.edu.br",
    lattes: "http://lattes.cnpq.br/0000000000000002",
    areas: ["Ciência da Computação", "Engenharias"],
    subareas: ["Redes e Segurança", "Automação"],
    bio: "Coordena o grupo de pesquisa em sistemas embarcados e orienta projetos de Iniciação Científica.",
    iniciais: "MT",
  },
  {
    id: "juliana-castro",
    nome: "Juliana Castro",
    papel: "Estudante",
    curso: "Análise e Desenvolvimento de Sistemas — 4º semestre",
    emailProfissional: "juliana.castro@brazcubas.edu.br",
    lattes: "http://lattes.cnpq.br/0000000000000003",
    areas: ["Análise e Desenvolvimento de Sistemas"],
    subareas: ["Desenvolvimento Web", "Experiência do Usuário"],
    bio: "Pesquisa acessibilidade digital em portais universitários.",
    iniciais: "JC",
  },
  {
    id: "rafael-nunes",
    nome: "Rafael Nunes",
    papel: "Estudante",
    curso: "Enfermagem — 8º semestre",
    emailProfissional: "rafael.nunes@brazcubas.edu.br",
    lattes: "http://lattes.cnpq.br/0000000000000004",
    areas: ["Saúde"],
    subareas: ["Saúde Digital"],
    bio: "Estuda uso de aplicativos de triagem em unidades básicas de saúde de Mogi das Cruzes.",
    iniciais: "RN",
  },
  {
    id: "beatriz-lima",
    nome: "Profa. Ma. Beatriz Lima",
    papel: "Conselho",
    curso: "Conselho de Pesquisa — Humanas e Sociais",
    emailProfissional: "beatriz.lima@brazcubas.edu.br",
    lattes: "http://lattes.cnpq.br/0000000000000005",
    areas: ["Humanas e Sociais"],
    subareas: ["Educação", "Direito Digital"],
    bio: "Avaliadora dos Anais do ENCIBRAC e responsável por editais de extensão.",
    iniciais: "BL",
  },
];

export type Artigo = {
  id: string;
  titulo: string;
  resumo: string;
  autores: string[];
  orientador?: string;
  area: string;
  subarea: string;
  evento: string;
  ano: number;
};

export const artigos: Artigo[] = [
  {
    id: "llm-atendimento",
    titulo: "Modelos de linguagem no atendimento estudantil: um estudo de caso",
    resumo:
      "Avaliação de um assistente virtual para dúvidas acadêmicas, com redução de 38% no tempo médio de resposta da secretaria.",
    autores: ["Ana Ribeiro"],
    orientador: "Prof. Dr. Marcos Tavares",
    area: "Ciência da Computação",
    subarea: "Inteligência Artificial",
    evento: "Anais do ENCIBRAC",
    ano: 2025,
  },
  {
    id: "acessibilidade-portais",
    titulo: "Acessibilidade digital em portais universitários brasileiros",
    resumo:
      "Análise de 12 portais segundo a WCAG 2.2, apontando falhas recorrentes em contraste e navegação por teclado.",
    autores: ["Juliana Castro"],
    orientador: "Profa. Ma. Beatriz Lima",
    area: "Análise e Desenvolvimento de Sistemas",
    subarea: "Experiência do Usuário",
    evento: "Anais do ENCIBRAC",
    ano: 2025,
  },
  {
    id: "seguranca-iot",
    titulo: "Segurança em dispositivos IoT de baixo custo em laboratórios acadêmicos",
    resumo: "Mapeamento de vulnerabilidades em sensores usados em projetos de automação da universidade.",
    autores: ["Prof. Dr. Marcos Tavares", "Ana Ribeiro"],
    area: "Ciência da Computação",
    subarea: "Redes e Segurança",
    evento: "PIBIC — Relatório final",
    ano: 2024,
  },
  {
    id: "triagem-digital",
    titulo: "Triagem digital em unidades básicas de saúde: percepção da equipe",
    resumo: "Pesquisa qualitativa com 24 profissionais sobre adoção de aplicativos de triagem.",
    autores: ["Rafael Nunes"],
    orientador: "Profa. Ma. Beatriz Lima",
    area: "Saúde",
    subarea: "Saúde Digital",
    evento: "Anais do ENCIBRAC",
    ano: 2024,
  },
  {
    id: "dados-evasao",
    titulo: "Predição de evasão com dados acadêmicos anonimizados",
    resumo: "Comparação de três algoritmos de classificação para identificar risco de evasão no primeiro ano.",
    autores: ["Ana Ribeiro", "Juliana Castro"],
    orientador: "Prof. Dr. Marcos Tavares",
    area: "Ciência da Computação",
    subarea: "Ciência de Dados",
    evento: "PIBIC — Congresso Interno",
    ano: 2025,
  },
  {
    id: "pipeline-devops",
    titulo: "Pipeline de entrega contínua aplicado a projetos de extensão",
    resumo: "Relato de experiência sobre automação de deploy em projetos mantidos por estudantes.",
    autores: ["Juliana Castro"],
    area: "Análise e Desenvolvimento de Sistemas",
    subarea: "DevOps",
    evento: "Anais do ENCIBRAC",
    ano: 2023,
  },
];

export type Evento = {
  id: string;
  nome: string;
  data: string;
  local: string;
  descricao: string;
  tipo: "Congresso" | "Edital" | "Encontro";
};

export const eventos: Evento[] = [
  {
    id: "encibrac",
    nome: "ENCIBRAC — Encontro Científico Braz Cubas",
    data: "Outubro de 2026",
    local: "Campus Braz Cubas, Mogi das Cruzes",
    descricao:
      "Encontro anual que publica mais de 100 artigos de todos os cursos nos Anais. Submissões de resumos expandidos abrem em agosto.",
    tipo: "Congresso",
  },
  {
    id: "pibic",
    nome: "PIBIC — Programa de Iniciação Científica",
    data: "Inscrições até 30 de abril",
    local: "Pró-reitoria de Pesquisa",
    descricao:
      "Programa de bolsas de iniciação científica. O estudante escolhe um orientador cadastrado e envia o plano de trabalho.",
    tipo: "Edital",
  },
  {
    id: "roda-tech",
    nome: "Roda Tech Circles",
    data: "Toda última quinta-feira do mês",
    local: "Laboratório 3 — Bloco B",
    descricao: "Encontro aberto onde estudantes apresentam pesquisas em andamento em 10 minutos.",
    tipo: "Encontro",
  },
  {
    id: "oficina-escrita",
    nome: "Oficina de escrita científica",
    data: "Maio de 2026",
    local: "Biblioteca Central",
    descricao: "Oficina prática sobre estrutura de artigos, normas ABNT e submissão aos Anais.",
    tipo: "Encontro",
  },
];

export type Glossario = {
  termo: string;
  definicao: string;
  link: string;
};

export const glossario: Glossario[] = [
  {
    termo: "Anais",
    definicao: "Publicação que reúne os trabalhos apresentados em um evento científico.",
    link: "https://pt.wikipedia.org/wiki/Anais_(publica%C3%A7%C3%A3o)",
  },
  {
    termo: "PIBIC",
    definicao: "Programa Institucional de Bolsas de Iniciação Científica, financiado pelo CNPq.",
    link: "https://www.gov.br/cnpq/pt-br/acesso-a-informacao/acoes-e-programas/servicos/bolsas-e-auxilios/modalidades/bolsas-individuais-no-pais/pibic",
  },
  {
    termo: "Currículo Lattes",
    definicao: "Currículo acadêmico padronizado mantido pela Plataforma Lattes do CNPq.",
    link: "https://lattes.cnpq.br/",
  },
  {
    termo: "Peer review",
    definicao: "Revisão por pares: avaliação de um trabalho por pesquisadores da mesma área antes da publicação.",
    link: "https://pt.wikipedia.org/wiki/Revis%C3%A3o_por_pares",
  },
  {
    termo: "DOI",
    definicao: "Identificador digital permanente atribuído a uma publicação científica.",
    link: "https://pt.wikipedia.org/wiki/Digital_Object_Identifier",
  },
  {
    termo: "WCAG",
    definicao: "Diretrizes internacionais de acessibilidade para conteúdo web.",
    link: "https://www.w3.org/WAI/standards-guidelines/wcag/",
  },
];
