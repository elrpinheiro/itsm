import type { ClassificationLabel } from './catalog'

export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type StatusChamado = 'Na fila' | 'Em atendimento' | 'Aguardando terceiro' | 'Fechado'
/** Canal de origem do atendimento — de onde veio o relato que virou este chamado. */
export type OrigemAtendimento = 'Atendente' | '0800 (URA)' | 'WhatsApp'

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
}

/** Fila de chamados mockada — exemplo de como a tela de Chamados fica quando populada. */
export const CHAMADOS: Chamado[] = [
  { numero: '#10231', projetoNome: 'Escola do Futuro — Caçapava', assunto: 'Impressora não imprime em rede', prioridade: 'Alta', status: 'Na fila', abertoHa: '26h' },
  { numero: '#10232', projetoNome: 'ConectaOZ — Osasco', assunto: 'Computador não liga na sala 4', prioridade: 'Crítica', status: 'Na fila', abertoHa: '31h' },
  { numero: '#10233', projetoNome: 'EducaJuquitiba — Juquitiba', assunto: 'Solicitação de troca de mouse', prioridade: 'Baixa', status: 'Na fila', abertoHa: '3h' },
  { numero: '#10234', projetoNome: 'Incluir Tecnológico — Cerquilho', assunto: 'Internet instável no laboratório', prioridade: 'Média', status: 'Em atendimento', abertoHa: '12h' },
  { numero: '#10235', projetoNome: 'Eu Tenho Futuro — Osasco', assunto: 'Instalação de software educacional', prioridade: 'Baixa', status: 'Na fila', abertoHa: '5h' },
  { numero: '#10236', projetoNome: 'Aedifica — São Paulo', assunto: 'Monitor com tela piscando', prioridade: 'Média', status: 'Aguardando terceiro', abertoHa: '48h' },
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
  },
]
