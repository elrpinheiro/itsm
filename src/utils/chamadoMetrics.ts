import type { Chamado, StatusChamado } from '@/data/chamados'
import { isFimDeSemanaOuFeriado } from './feriadosNacionais'

/** Converte o texto livre de "abertoHa" (ex.: "26h", "18 dias", "agora mesmo") em horas decorridas. */
export function parseAbertoHaEmHoras(abertoHa: string): number {
  const dias = abertoHa.match(/(\d+)\s*dia/i)
  if (dias) return Number(dias[1]) * 24
  const horas = abertoHa.match(/(\d+)\s*h/i)
  if (horas) return Number(horas[1])
  return 0
}

/** Expediente considerado para o relógio do SLA — 08:00 às 18:00, em todos os projetos (regra
 * definida pela gestão em 2026-07). Fora dessa janela (e em fins de semana/feriados) o relógio fica
 * travado, exceto para chamados Críticos (ver `horasUteisDecorridas`). */
const EXPEDIENTE_INICIO_HORA = 8
const EXPEDIENTE_FIM_HORA = 18

/** Horas de expediente decorridas desde a abertura: só conta o tempo dentro do horário comercial
 * (08:00–18:00) em dias que não são fim de semana nem feriado nacional — o relógio do SLA fica
 * "travado" fora disso, exceto para chamados Críticos (P1), que mantêm atendimento contínuo 24x7 sem
 * pausar, como na política original. Como "abertoHa" é só um texto livre (não guarda a data/hora
 * exata de abertura), aproxima o instante de abertura como `agora − horas totais decorridas` e depois
 * soma, dia a dia, a sobreposição entre a janela [abertura, agora] e o expediente de cada dia útil. */
export function horasUteisDecorridas(chamado: Chamado, agora: Date = new Date()): number {
  const totalHoras = parseAbertoHaEmHoras(chamado.abertoHa)
  if (chamado.prioridade === 'Crítica' || totalHoras <= 0) return totalHoras
  const abertoEm = new Date(agora.getTime() - totalHoras * 3600 * 1000)

  let horasUteis = 0
  const cursorDia = new Date(abertoEm.getFullYear(), abertoEm.getMonth(), abertoEm.getDate())
  const ultimoDia = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
  while (cursorDia.getTime() <= ultimoDia.getTime()) {
    if (!isFimDeSemanaOuFeriado(cursorDia)) {
      const expedienteInicio = new Date(cursorDia)
      expedienteInicio.setHours(EXPEDIENTE_INICIO_HORA, 0, 0, 0)
      const expedienteFim = new Date(cursorDia)
      expedienteFim.setHours(EXPEDIENTE_FIM_HORA, 0, 0, 0)

      const sobreposicaoInicio = Math.max(abertoEm.getTime(), expedienteInicio.getTime())
      const sobreposicaoFim = Math.min(agora.getTime(), expedienteFim.getTime())
      if (sobreposicaoFim > sobreposicaoInicio) {
        horasUteis += (sobreposicaoFim - sobreposicaoInicio) / (3600 * 1000)
      }
    }
    cursorDia.setDate(cursorDia.getDate() + 1)
  }
  return horasUteis
}

export interface SlaResumo {
  percentual: number | null
  foraDoPrazo: number
  total: number
}

/** % de chamados dentro do prazo-alvo (TTR) da própria prioridade, considerando as horas úteis
 * decorridas (`horasUteisDecorridas`, que só conta o expediente — 08:00–18:00 em dias que não são
 * fim de semana nem feriado nacional —, exceto para Críticos, que contam 24x7) — para chamados
 * fechados isso é uma aproximação do tempo até a resolução. O prazo-alvo
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

/** Status ainda considerados "em aberto" para fins de backlog — solucionado/fechado já saíram da
 * fila de trabalho ativo do técnico. */
const STATUS_BACKLOG: StatusChamado[] = ['Na fila', 'Em atendimento', 'Processando (planejado)', 'Aguardando terceiro']

/** Instante aproximado de abertura de um chamado, a partir do texto livre "abertoHa" — mesma
 * aproximação usada em `horasUteisDecorridas` (o sistema não guarda a data/hora exata de abertura). */
export function aberturaAproximada(chamado: Chamado, agora: Date = new Date()): Date {
  return new Date(agora.getTime() - parseAbertoHaEmHoras(chamado.abertoHa) * 3600 * 1000)
}

export type PeriodoFiltro = 'hoje' | 'semana' | 'mes' | 'todos'

/** Opções do filtro de período dos dashboards (Painel Geral e Início), na ordem em que aparecem. */
export const PERIODO_FILTRO_OPCOES: { valor: PeriodoFiltro; label: string }[] = [
  { valor: 'hoje', label: 'Hoje' },
  { valor: 'semana', label: 'Últimos 7 dias' },
  { valor: 'mes', label: 'Este mês' },
  { valor: 'todos', label: 'Todos' },
]

/** Filtra chamados pelo período de abertura (aproximado via `aberturaAproximada`) — usado pelo
 * filtro de período dos dashboards. "Hoje" e "este mês" usam o dia/mês corrente; "últimos 7 dias" é
 * uma janela corrida (não a semana do calendário). */
export function filtrarPorPeriodo(chamados: Chamado[], periodo: PeriodoFiltro, agora: Date = new Date()): Chamado[] {
  if (periodo === 'todos') return chamados
  return chamados.filter((c) => {
    const abertura = aberturaAproximada(c, agora)
    if (periodo === 'hoje') {
      return (
        abertura.getFullYear() === agora.getFullYear() &&
        abertura.getMonth() === agora.getMonth() &&
        abertura.getDate() === agora.getDate()
      )
    }
    if (periodo === 'semana') {
      const seteDiasAtras = agora.getTime() - 7 * 24 * 3600 * 1000
      return abertura.getTime() >= seteDiasAtras
    }
    return abertura.getFullYear() === agora.getFullYear() && abertura.getMonth() === agora.getMonth()
  })
}

export interface BacklogResumo {
  backlog: number
  abertosNoMes: number
  percentual: number | null
}

/** Backlog (chamados ainda não solucionados nem fechados) comparado ao volume de chamados abertos
 * no mês corrente — regra definida pela gestão (2026-07): o backlog não deve passar de uma meta (ex.:
 * 10%) dos chamados abertos no mês, em nenhum projeto. `percentual` é `null` quando não há chamados
 * abertos no mês corrente (nada para comparar). */
export function calcularBacklog(chamados: Chamado[], agora: Date = new Date()): BacklogResumo {
  const backlog = chamados.filter((c) => STATUS_BACKLOG.includes(c.status)).length
  const abertosNoMes = chamados.filter((c) => {
    const abertura = aberturaAproximada(c, agora)
    return abertura.getFullYear() === agora.getFullYear() && abertura.getMonth() === agora.getMonth()
  }).length
  return {
    backlog,
    abertosNoMes,
    percentual: abertosNoMes > 0 ? Math.round((backlog / abertosNoMes) * 100) : null,
  }
}

/** Compara o % de backlog contra a meta (ex.: 10%) — aqui, diferente do SLA, "dentro da meta" é
 * ficar ABAIXO ou igual ao limite, não acima. `null` quando não há chamados abertos no mês para
 * julgar. */
export function atingiuMetaBacklog(backlog: BacklogResumo, metaPercentual: number): boolean | null {
  return backlog.percentual === null ? null : backlog.percentual <= metaPercentual
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
