import type { Chamado, Prioridade } from '@/data/chamados'

/** Prazo-alvo de SLA por prioridade, em horas — política padrão assumida (ajustável por cliente); o
 * sistema ainda não tem um cadastro de SLA por contrato, então isso serve de referência para o MVP. */
export const SLA_TARGET_HORAS: Record<Prioridade, number> = {
  Crítica: 4,
  Alta: 8,
  Média: 24,
  Baixa: 72,
}

/** Converte o texto livre de "abertoHa" (ex.: "26h", "18 dias", "agora mesmo") em horas decorridas. */
export function parseAbertoHaEmHoras(abertoHa: string): number {
  const dias = abertoHa.match(/(\d+)\s*dia/i)
  if (dias) return Number(dias[1]) * 24
  const horas = abertoHa.match(/(\d+)\s*h/i)
  if (horas) return Number(horas[1])
  return 0
}

export interface SlaResumo {
  percentual: number | null
  foraDoPrazo: number
  total: number
}

/** % de chamados dentro do prazo-alvo da própria prioridade (SLA_TARGET_HORAS), considerando o tempo
 * decorrido em "abertoHa" — para chamados fechados isso é uma aproximação do tempo até a resolução. */
export function calcularSla(chamados: Chamado[]): SlaResumo {
  if (chamados.length === 0) return { percentual: null, foraDoPrazo: 0, total: 0 }
  const foraDoPrazo = chamados.filter((c) => parseAbertoHaEmHoras(c.abertoHa) > SLA_TARGET_HORAS[c.prioridade]).length
  return {
    percentual: Math.round(((chamados.length - foraDoPrazo) / chamados.length) * 100),
    foraDoPrazo,
    total: chamados.length,
  }
}

export interface NpsResumo {
  nps: number
  promotores: number
  neutros: number
  detratores: number
  avaliados: number
}

/** NPS clássico (promotores 9–10 menos detratores 0–6, em %) a partir das notas de satisfação
 * (0–10) já registradas. Retorna null quando nenhum chamado tem nota — não há o que calcular. */
export function calcularNps(chamados: Chamado[]): NpsResumo | null {
  const avaliados = chamados.filter((c) => typeof c.notaSatisfacao === 'number')
  if (avaliados.length === 0) return null
  const promotores = avaliados.filter((c) => c.notaSatisfacao! >= 9).length
  const detratores = avaliados.filter((c) => c.notaSatisfacao! <= 6).length
  const neutros = avaliados.length - promotores - detratores
  return {
    nps: Math.round(((promotores - detratores) / avaliados.length) * 100),
    promotores,
    neutros,
    detratores,
    avaliados: avaliados.length,
  }
}
