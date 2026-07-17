import type { ClassificationLabel } from './catalog'

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
/**
 * Ciclo de vida do chamado — os 6 status do GLPI (Assistência → Chamados → ciclo de vida):
 * Na fila (New) → Em atendimento (Processing assigned) → Processando (planejado) (Processing planned)
 * → [Aguardando terceiro (Pending)] → Solucionado (Solved) → Fechado (Closed). Os rótulos exibidos
 * (Administração → Listas Suspensas) usam a nomenclatura em português do GLPI (Novo/Processando
 * atribuído/Processando planejado/Pendente); a chave interna abaixo é que fica fixa.
 */
export type StatusChamado =
  | 'Na fila'
  | 'Em atendimento'
  | 'Processando (planejado)'
  | 'Aguardando terceiro'
  | 'Solucionado'
  | 'Fechado'
/** Ordem canônica do ciclo de vida — usada pelo widget "Ciclo de vida" no detalhe do chamado. */
export const CICLO_VIDA_ORDEM: StatusChamado[] = [
  'Na fila',
  'Em atendimento',
  'Processando (planejado)',
  'Aguardando terceiro',
  'Solucionado',
  'Fechado',
]
/** Canal de origem do atendimento — de onde veio o relato que virou este chamado. */
export type OrigemAtendimento = 'Atendente' | '0800 (URA)' | 'WhatsApp'

/** Tipo de evento na timeline do chamado — espelha as abas do GLPI (Acompanhamentos/Tarefas/Solução)
 * mais um tipo "sistema" para as próprias mudanças de status, que viram uma nota na timeline. */
export type TipoInteracao = 'acompanhamento' | 'tarefa' | 'solucao' | 'sistema'

export interface InteracaoChamado {
  id: string
  tipo: TipoInteracao
  /** Canal de onde veio esta interação específica — permite que um chamado aberto pelo 0800 receba
   * uma resposta depois pelo WhatsApp, por exemplo, sem perder o histórico de canal por mensagem. */
  origem: OrigemAtendimento | 'Sistema'
  /** Acompanhamentos podem ser privados (troca só entre técnicos, GLPI chama de "private follow-up") —
   * tarefa, solução e eventos de sistema são sempre públicos. */
  publico: boolean
  autor: string
  texto: string
  criadoEm: string
}

export interface Chamado {
  numero: string
  projetoNome: string
  assunto: string
  prioridade: Prioridade
  status: StatusChamado
  abertoHa: string
  /** E-mail de quem abriu o chamado (o requerente) — usado para filtrar "meus chamados" em perfis com visibilidade "próprios" e para montar o histórico do requerente. */
  solicitanteEmail?: string
  /** Item do catálogo do projeto (ex.: "Notebook", "Internet") — sugerido pela IA a partir da descrição. */
  categoria?: string
  /** Requisição / Incidente / Problema / Habilitação de Mudanças — sugerido pela IA. */
  tipoAtendimento?: ClassificationLabel
  /** Grupo de atendimento (Administração → Grupos) escalado pela IA. */
  grupoId?: string
  origem?: OrigemAtendimento
  descricao?: string
  /** Preenchido quando o chamado é encerrado na hora ("Chamado solucionado? Sim"). */
  acaoRealizada?: string
  /** Números de chamados anteriores do mesmo requerente vinculados manualmente como associação (só para contabilizar recorrência). */
  vinculados?: string[]
  /** Linkedid informado quando a origem é 0800 (URA) — identifica a ligação na central telefônica. */
  linkedId?: string
  /** Referência da gravação da ligação, localizada a partir do Linkedid e anexada ao acompanhamento do chamado (simulado). */
  gravacaoUrl?: string
  /** Protocolo informado quando a origem é WhatsApp — usado para importar a conversa para a descrição. */
  protocoloWhatsapp?: string
  /** Patrimônios (Ativos) vinculados a este chamado. */
  ativosVinculados?: string[]
  /** Nota de satisfação (0–10, escala NPS) da pesquisa pós-atendimento respondida pelo requerente. Ausente = pesquisa não respondida (o sistema não tem envio automático de pesquisa nesta versão — ver 05.16 da documentação técnica). */
  notaSatisfacao?: number
  /** Técnico que assumiu o chamado (Processing assigned). Ausente enquanto o chamado está "Na fila". */
  atribuidoA?: string
  /** Timeline do chamado — acompanhamentos, tarefas, solução e eventos de sistema, em ordem cronológica. */
  interacoes?: InteracaoChamado[]
  /** Estado do aceite formal (dupla assinatura técnico+requerente) que a Assinatura Digital dispara
   * quando o chamado vira "Solucionado" — ver 05.24 da documentação técnica. Ausente antes de solucionar. */
  assinaturaStatus?: 'pendente' | 'assinada' | 'rejeitada'
}

/** Fila de chamados mockada — exemplo de como a tela de Chamados fica quando populada. */
export const CHAMADOS: Chamado[] = [
  { numero: '#10231', projetoNome: 'Escola do Futuro — Caçapava', assunto: 'Impressora não imprime em rede', prioridade: 'Alta', status: 'Na fila', abertoHa: '26h' },
  { numero: '#10232', projetoNome: 'ConectaOZ — Osasco', assunto: 'Computador não liga na sala 4', prioridade: 'Crítica', status: 'Na fila', abertoHa: '31h' },
  { numero: '#10233', projetoNome: 'EducaJuquitiba — Juquitiba', assunto: 'Solicitação de troca de mouse', prioridade: 'Baixa', status: 'Na fila', abertoHa: '3h' },
  {
    numero: '#10234',
    projetoNome: 'Incluir Tecnológico — Cerquilho',
    assunto: 'Internet instável no laboratório',
    prioridade: 'Média',
    status: 'Processando (planejado)',
    abertoHa: '12h',
    origem: '0800 (URA)',
    atribuidoA: 'Rafael Souza',
    interacoes: [
      { id: 'int-10234-1', tipo: 'sistema', origem: 'Sistema', publico: true, autor: 'Sistema', texto: 'Chamado aberto via 0800 (URA).', criadoEm: 'há 12h' },
      { id: 'int-10234-2', tipo: 'sistema', origem: 'Sistema', publico: true, autor: 'Rafael Souza', texto: 'Rafael Souza assumiu o chamado.', criadoEm: 'há 10h' },
      { id: 'int-10234-3', tipo: 'acompanhamento', origem: 'WhatsApp', publico: true, autor: 'Requerente', texto: 'A internet caiu de novo agora, só no laboratório 2.', criadoEm: 'há 3h' },
      { id: 'int-10234-4', tipo: 'tarefa', origem: 'Atendente', publico: true, autor: 'Rafael Souza', texto: 'Agendada verificação do switch do laboratório 2 amanhã às 9h.', criadoEm: 'há 2h' },
    ],
  },
  { numero: '#10235', projetoNome: 'Eu Tenho Futuro — Osasco', assunto: 'Instalação de software educacional', prioridade: 'Baixa', status: 'Na fila', abertoHa: '5h' },
  {
    numero: '#10236',
    projetoNome: 'Aedifica — São Paulo',
    assunto: 'Monitor com tela piscando',
    prioridade: 'Média',
    status: 'Aguardando terceiro',
    abertoHa: '48h',
    origem: 'Atendente',
    atribuidoA: 'Rafael Souza',
    interacoes: [
      { id: 'int-10236-1', tipo: 'sistema', origem: 'Sistema', publico: true, autor: 'Rafael Souza', texto: 'Rafael Souza assumiu o chamado.', criadoEm: 'há 47h' },
      { id: 'int-10236-2', tipo: 'sistema', origem: 'Sistema', publico: true, autor: 'Rafael Souza', texto: 'Chamado colocado em pendência: aguardando peça de reposição do fornecedor.', criadoEm: 'há 30h' },
    ],
  },
  { numero: '#10237', projetoNome: 'EducaTaboão — Taboão da Serra', assunto: 'Chamado de manutenção preventiva mensal', prioridade: 'Baixa', status: 'Na fila', abertoHa: '2h' },
  { numero: '#10238', projetoNome: 'Escola do Futuro — Porto Feliz', assunto: 'Roteador reiniciando sozinho', prioridade: 'Alta', status: 'Na fila', abertoHa: '9h' },
  {
    numero: '#10239',
    projetoNome: 'Infância Conectada — Serra Negra',
    assunto: 'Solicitação de acesso ao sistema educacional',
    prioridade: 'Baixa',
    status: 'Na fila',
    abertoHa: '1h',
    solicitanteEmail: 'isadora.pinheiro@vitaebrasil.com.br',
    categoria: 'Dúvidas/sugestões/elogios ou reclamações',
    tipoAtendimento: 'Requisição',
    grupoId: 'grp-central-atendimento',
  },
  {
    numero: '#10201',
    projetoNome: 'Infância Conectada — Serra Negra',
    assunto: 'Notebook não ligava mais',
    prioridade: 'Alta',
    status: 'Fechado',
    abertoHa: '32 dias',
    solicitanteEmail: 'isadora.pinheiro@vitaebrasil.com.br',
    categoria: 'Notebook',
    tipoAtendimento: 'Incidente',
    grupoId: 'grp-n2',
    origem: 'Atendente',
    descricao: 'Notebook não ligava mais — bateria não carregava.',
    acaoRealizada: 'Troca de bateria realizada em bancada.',
    notaSatisfacao: 9,
  },
  {
    numero: '#10214',
    projetoNome: 'Infância Conectada — Serra Negra',
    assunto: 'Notebook com tela travando',
    prioridade: 'Alta',
    status: 'Fechado',
    abertoHa: '18 dias',
    solicitanteEmail: 'isadora.pinheiro@vitaebrasil.com.br',
    categoria: 'Notebook',
    tipoAtendimento: 'Incidente',
    grupoId: 'grp-n2',
    origem: 'WhatsApp',
    descricao: 'Notebook travando e reiniciando sozinho durante o uso.',
    acaoRealizada: 'Reinstalação do sistema e atualização de drivers.',
    notaSatisfacao: 7,
  },
  {
    numero: '#10240',
    projetoNome: 'Infância Conectada — Serra Negra',
    assunto: 'Projetor da sala 3 sem sinal de vídeo',
    prioridade: 'Alta',
    status: 'Solucionado',
    abertoHa: '6h',
    solicitanteEmail: 'isadora.pinheiro@vitaebrasil.com.br',
    categoria: 'Projetor',
    tipoAtendimento: 'Incidente',
    grupoId: 'grp-n1',
    origem: 'Atendente',
    atribuidoA: 'Rafael Souza',
    descricao: 'Projetor liga mas não recebe sinal de vídeo do notebook da sala.',
    acaoRealizada: 'Cabo HDMI trocado — o antigo estava com o conector danificado.',
    assinaturaStatus: 'pendente',
    interacoes: [
      { id: 'int-10240-1', tipo: 'sistema', origem: 'Sistema', publico: true, autor: 'Sistema', texto: 'Chamado aberto.', criadoEm: 'há 6h' },
      { id: 'int-10240-2', tipo: 'sistema', origem: 'Sistema', publico: true, autor: 'Rafael Souza', texto: 'Rafael Souza assumiu o chamado.', criadoEm: 'há 5h' },
      { id: 'int-10240-3', tipo: 'acompanhamento', origem: 'Atendente', publico: false, autor: 'Rafael Souza', texto: 'Testado com outro cabo HDMI — confirma que o problema é no cabo, não na entrada do projetor.', criadoEm: 'há 2h' },
      { id: 'int-10240-4', tipo: 'solucao', origem: 'Atendente', publico: true, autor: 'Rafael Souza', texto: 'Cabo HDMI trocado — o antigo estava com o conector danificado.', criadoEm: 'há 1h' },
    ],
  },
]
