import type { Chamado } from '@/data/chamados'
import { isFimDeSemanaOuFeriado } from './feriadosNacionais'

/** Converte o texto livre de "abertoHa" (ex.: "26h", "18 dias", "agora mesmo") em horas decorridas. */
export function parseAbertoHaEmHoras(abertoHa: string): number {
  const dias = abertoHa.match(/(\d+)\s*dia/i)
  if (dias) return Number(dias[1]) * 24
  const horas = abertoHa.match(/(\d+)\s*h/i)
  if (horas) return Number(horas[1])
  return 0
}

/** Horas decorridas desde a abertura, já descontando sábados, domingos e feriados nacionais — o
 * relógio do SLA fica "travado" nesses dias (regra definida pela gestão em 2026-07), exceto para
 * chamados Críticos (P1), que mantêm atendimento contínuo 24x7 sem pausar, como na política original.
 * Como "abertoHa" é só um texto livre (não guarda a data/hora exata de abertura), aproxima o instante
 * de abertura como `agora − horas totais decorridas` e subtrai 24h para cada dia (completo) de fim de
 * semana/feriado dentro dessa janela — uma aproximação por dia inteiro, não por hora exata. */
export function horasUteisDecorridas(chamado: Chamado, agora: Date = new Date()): number {
  const totalHoras = parseAbertoHaEmHoras(chamado.abertoHa)
  if (chamado.prioridade === 'Crítica' || totalHoras <= 0) return totalHoras
  const abertoEm = new Date(agora.getTime() - totalHoras * 3600 * 1000)
  let horasBloqueadas = 0
  const cursor = new Date(abertoEm.getFullYear(), abertoEm.getMonth(), abertoEm.getDate())
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  while (cursor.getTime() <= ultimoDia.getTime()) {
    if (isFimDeSemanaOuFeriado(cursor)) horasBloqueadas += 24
    cursor.setDate(cursor.getDate() + 1)
  }
  return Math.max(0, totalHoras - horasBloqueadas)
}

export interface SlaResumo {
  percentual: number | null
  foraDoPrazo: number
  total: number
}

/** % de chamados dentro do prazo-alvo (TTR) da própria prioridade, considerando as horas úteis
 * decorridas (`horasUteisDecorridas`, que trava em fins de semana e feriados nacionais, exceto para
 * Críticos) — para chamados fechados isso é uma aproximação do tempo até a resolução. O prazo-alvo
 * (TTR) vem de Administração → Níveis de Serviço (useSlaStore), por projeto, não é mais fixo no
 * código. `resolverTtr` devolve o TTR (horas) aplicável a um chamado, ou `undefined` quando o
 * projeto dele ainda não tem SLA configurado — esses chamados ficam de fora do cálculo (não entram
 * nem no total nem no "fora do prazo"). */
export function calcularSla(chamados: Chamado[], resolverTtr: (chamado: Chamado) => number | undefined): SlaResumo {
  const agora = new Date()
  const elegiveis = chamados.filter((c) => resolverTtr(c) !== undefined)
  if (elegiveis.length === 0) return { percentual: null, foraDoPrazo: 0, total: 0 }
  const foraDoPrazo = elegiveis.filter((c) => horasUteisDecorridas(c, agora) > resolverTtr(c)!).length
  return {
    percentual: Math.round(((elegiveis.length - foraDoPrazo) / elegiveis.length) * 100),
    foraDoPrazo,
    total: elegiveis.length,
  }
}

/** Compara o % de cumprimento contra a meta (ex.: 85%) — `null` quando não há chamados elegíveis
 * para julgar (SLA não configurado para o projeto, ou nenhum chamado ainda). */
export function atingiuMeta(sla: SlaResumo, metaPercentual: number): boolean | null {
  return sla.percentual === null ? null : sla.percentual >= metaPercentual
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
