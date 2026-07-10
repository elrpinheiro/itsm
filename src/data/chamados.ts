export type Prioridade = 'Baixa' | 'Média' | 'Alta' | 'Crítica'
export type StatusChamado = 'Na fila' | 'Em atendimento' | 'Aguardando terceiro'

export interface Chamado {
  numero: string
  projetoNome: string
  assunto: string
  prioridade: Prioridade
  status: StatusChamado
  abertoHa: string
  /** E-mail de quem abriu o chamado — usado para filtrar "meus chamados" em perfis com visibilidade "próprios". */
  solicitanteEmail?: string
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
  },
]
