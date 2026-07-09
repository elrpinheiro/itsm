export const VISIBILIDADE_OPTIONS = ['Mudança Padrão', 'Normal', 'Emergencial']

export interface VisibilidadeLegendItem {
  label: string
  caracteristicas: string
  aprovacao: string
  exemplo: string
}

/** Legenda dos tipos de visibilidade/classificação de uma Habilitação de Mudanças (ITIL), exibida no final do documento. */
export const VISIBILIDADE_LEGEND: VisibilidadeLegendItem[] = [
  {
    label: 'Mudança Padrão (Standard Change)',
    caracteristicas: 'Baixo risco, pré-aprovada, bem documentada e repetitiva.',
    aprovacao:
      'Não precisa de aprovação individual a cada execução — já foi aprovada previamente e está catalogada como procedimento padrão.',
    exemplo: 'Instalar um software homologado, criar um usuário de rede.',
  },
  {
    label: 'Mudança Normal (Normal Change)',
    caracteristicas:
      'Precisa passar por avaliação e agendamento antes de ser implementada; risco e impacto variam (podem ser baixos, médios ou altos).',
    aprovacao:
      'Avaliada e autorizada por uma autoridade de mudança — pode ser o CAB (Change Advisory Board), um gestor de mudanças ou, em casos mais simples, aprovação automatizada, dependendo do risco.',
    exemplo: 'Atualizar a versão de um sistema, alterar configuração de servidor.',
  },
  {
    label: 'Mudança Emergencial (Emergency Change)',
    caracteristicas:
      'Precisa ser implementada o mais rápido possível, geralmente para resolver um incidente crítico ou vulnerabilidade grave.',
    aprovacao:
      'Processo de aprovação acelerado — muitas vezes um ECAB (Emergency Change Advisory Board), grupo reduzido que pode aprovar rapidamente, às vezes até retroativamente (aprovação documentada depois da implementação, por urgência).',
    exemplo: 'Aplicar patch de segurança emergencial após descoberta de falha crítica.',
  },
]
