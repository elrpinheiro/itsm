/**
 * Sinalizadores de chamados por projeto — mock enquanto não há integração real com o
 * módulo de Assistência/ITSM. Ajuda a identificar rapidamente, na tela de seleção,
 * projetos com chamados na fila sem interação, sem atribuição, ou parados há mais de
 * 24h desde a abertura.
 */
export interface ProjectAlert {
  naFila: number
  semAtribuicao: number
  atrasados24h: number
}

export const PROJECT_ALERTS: Record<string, ProjectAlert> = {
  'osasco-eu-tenho-futuro': { naFila: 3, semAtribuicao: 1, atrasados24h: 0 },
  'taboao-da-serra-educataboao': { naFila: 0, semAtribuicao: 0, atrasados24h: 0 },
  'marilia-educacao-acolhedora': { naFila: 1, semAtribuicao: 0, atrasados24h: 2 },
  'ubatuba-nucleo-inovacao': { naFila: 0, semAtribuicao: 0, atrasados24h: 0 },
  'cacapava-escola-futuro': { naFila: 5, semAtribuicao: 2, atrasados24h: 0 },
  'serra-negra-infancia-conectada': { naFila: 0, semAtribuicao: 1, atrasados24h: 0 },
  'porto-feliz-escola-futuro': { naFila: 0, semAtribuicao: 0, atrasados24h: 0 },
  'cerquilho-incluir-tecnologico': { naFila: 2, semAtribuicao: 0, atrasados24h: 1 },
  'rio-claro-conectar-educacao': { naFila: 0, semAtribuicao: 0, atrasados24h: 0 },
  'osasco-conectaoz': { naFila: 4, semAtribuicao: 0, atrasados24h: 0 },
  'paraty-espaco-intec': { naFila: 0, semAtribuicao: 0, atrasados24h: 0 },
  'juquitiba-educajuquitiba': { naFila: 1, semAtribuicao: 1, atrasados24h: 1 },
  'sjc-fundhas': { naFila: 2, semAtribuicao: 0, atrasados24h: 0 },
}

export type AlertLevel = 'critico' | 'atencao' | null

export function getAlertLevel(alert?: ProjectAlert): AlertLevel {
  if (!alert) return null
  if (alert.atrasados24h > 0) return 'critico'
  if (alert.naFila > 0 || alert.semAtribuicao > 0) return 'atencao'
  return null
}

export function getAlertTotal(alert?: ProjectAlert): number {
  if (!alert) return 0
  return alert.naFila + alert.semAtribuicao + alert.atrasados24h
}

export function getAlertDescription(alert?: ProjectAlert): string {
  if (!alert) return ''
  const parts: string[] = []
  if (alert.atrasados24h > 0) {
    parts.push(`${alert.atrasados24h} chamado${alert.atrasados24h > 1 ? 's' : ''} há mais de 24h sem interação`)
  }
  if (alert.semAtribuicao > 0) {
    parts.push(`${alert.semAtribuicao} sem atribuição`)
  }
  if (alert.naFila > 0) {
    parts.push(`${alert.naFila} na fila aguardando interação`)
  }
  return parts.join(' · ')
}
