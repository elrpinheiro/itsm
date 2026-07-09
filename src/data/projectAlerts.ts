/**
 * Sinalizadores de chamados por projeto — mock enquanto não há integração real com o
 * módulo de Assistência/ITSM. Ajuda a identificar rapidamente, na tela de seleção,
 * projetos com chamados que precisam de atenção, por categoria de urgência.
 */
export type AlertKind = 'slaEstourado' | 'novo' | 'pendente' | 'semInteracao'

export interface ProjectAlert {
  slaEstourado?: number // vermelho — SLA estourado
  novo?: number // verde — novo chamado / sem atribuição
  pendente?: number // laranja — pendente / SLA pausado
  semInteracao?: number // azul — sem interação há mais de 24h
}

export const ALERT_META: Record<AlertKind, { className: string; label: string }> = {
  slaEstourado: { className: 'vermelho', label: 'SLA estourado' },
  novo: { className: 'verde', label: 'Novo chamado / sem atribuição' },
  pendente: { className: 'laranja', label: 'Pendente / SLA pausado' },
  semInteracao: { className: 'azul', label: 'Sem interação há mais de 24h' },
}

/** Ordem fixa de exibição dos badges em torno do logo (canto a canto). */
export const ALERT_ORDER: AlertKind[] = ['slaEstourado', 'novo', 'pendente', 'semInteracao']

export const PROJECT_ALERTS: Record<string, ProjectAlert> = {
  'osasco-eu-tenho-futuro': { novo: 3, pendente: 1 },
  'taboao-da-serra-educataboao': {},
  'marilia-educacao-acolhedora': { slaEstourado: 2, semInteracao: 1 },
  'ubatuba-nucleo-inovacao': {},
  'cacapava-escola-futuro': { novo: 5, pendente: 2 },
  'serra-negra-infancia-conectada': { pendente: 1 },
  'porto-feliz-escola-futuro': {},
  'cerquilho-incluir-tecnologico': { slaEstourado: 1, novo: 2, semInteracao: 1 },
  'rio-claro-conectar-educacao': {},
  'osasco-conectaoz': { novo: 4 },
  'paraty-espaco-intec': {},
  // exemplo com os 4 tipos de alerta simultâneos, para referência visual
  'juquitiba-educajuquitiba': { slaEstourado: 1, novo: 1, pendente: 1, semInteracao: 1 },
  'sjc-fundhas': { novo: 2 },
}

export function getAlerts(id: string): { kind: AlertKind; count: number }[] {
  const alert = PROJECT_ALERTS[id]
  if (!alert) return []
  return ALERT_ORDER.map((kind) => ({ kind, count: alert[kind] ?? 0 })).filter((a) => a.count > 0)
}
