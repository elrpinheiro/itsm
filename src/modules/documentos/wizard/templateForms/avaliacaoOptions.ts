import type { ChecklistAvaliacao } from '@/types'

export const AVALIACAO_META: Record<ChecklistAvaliacao, { label: string; icon: string; color: string }> = {
  nao_atende: { label: 'Não atende', icon: '❌', color: '#dc2626' },
  atencao: { label: 'Atende com ponto de atenção', icon: '⚠️', color: '#f59e0b' },
  atende: { label: 'Atende completamente', icon: '✔️', color: '#16a34a' },
}

export const AVALIACAO_ORDER: ChecklistAvaliacao[] = ['nao_atende', 'atencao', 'atende']
