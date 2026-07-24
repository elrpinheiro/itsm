import type { Chamado } from '@/data/chamados'

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

/** % de chamados dentro do prazo-alvo (TTR) da própria prioridade, considerando o tempo decorrido em
 * "abertoHa" — para chamados fechados isso é uma aproximação do tempo até a resolução. O prazo-alvo
 * (TTR) vem de Administração → Níveis de Serviço (useSlaStore), por projeto, não é mais fixo no
 * código. `resolverTtr` devolve o TTR (horas) aplicável a um chamado, ou `undefined` quando o
 * projeto dele ainda não tem SLA configurado (ex.: ConectaOZ — Osasco, em validação) — esses
 * chamados ficam de fora do cálculo (não entram nem no total nem no "fora do prazo"). */
export function calcularSla(chamados: Chamado[], resolverTtr: (chamado: Chamado) => number | undefined): SlaResumo {
  const elegiveis = chamados.filter((c) => resolverTtr(c) !== undefined)
  if (elegiveis.length === 0) return { percentual: null, foraDoPrazo: 0, total: 0 }
  const foraDoPrazo = elegiveis.filter((c) => parseAbertoHaEmHoras(c.abertoHa) > resolverTtr(c)!).length
  return {
    percentual: Math.round(((elegiveis.length - foraDoPrazo) / elegiveis.length) * 100),
    foraDoPrazo,
    total: elegiveis.length,
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
