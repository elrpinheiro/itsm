/** Feriados nacionais fixos (mesma data todo ano), conforme a legislação federal (Lei 6.802/80 e
 * leis subsequentes). */
const FERIADOS_FIXOS: Array<{ mes: number; dia: number }> = [
  { mes: 1, dia: 1 }, // Confraternização Universal
  { mes: 4, dia: 21 }, // Tiradentes
  { mes: 5, dia: 1 }, // Dia do Trabalho
  { mes: 9, dia: 7 }, // Independência do Brasil
  { mes: 10, dia: 12 }, // Nossa Senhora Aparecida
  { mes: 11, dia: 2 }, // Finados
  { mes: 11, dia: 15 }, // Proclamação da República
  { mes: 12, dia: 25 }, // Natal
]

/** Domingo de Páscoa (algoritmo de Gauss/Meeus) — base para a Sexta-feira Santa, o único feriado
 * nacional móvel considerado aqui. Carnaval e Corpus Christi ficam de fora por serem pontos
 * facultativos (não são feriados nacionais obrigatórios por lei). */
function calcularPascoa(ano: number): Date {
  const a = ano % 19
  const b = Math.floor(ano / 100)
  const c = ano % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const mes = Math.floor((h + l - 7 * m + 114) / 31)
  const dia = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(ano, mes - 1, dia)
}

function chaveDoDia(data: Date): string {
  return `${data.getFullYear()}-${data.getMonth() + 1}-${data.getDate()}`
}

const CACHE_FERIADOS_POR_ANO = new Map<number, Set<string>>()

/** Datas (uma por dia, sem hora) dos feriados nacionais de um ano — fixos + Sexta-feira Santa. */
function feriadosDoAno(ano: number): Set<string> {
  const emCache = CACHE_FERIADOS_POR_ANO.get(ano)
  if (emCache) return emCache
  const datas = new Set<string>()
  for (const { mes, dia } of FERIADOS_FIXOS) {
    datas.add(chaveDoDia(new Date(ano, mes - 1, dia)))
  }
  const pascoa = calcularPascoa(ano)
  const sextaSanta = new Date(pascoa)
  sextaSanta.setDate(pascoa.getDate() - 2)
  datas.add(chaveDoDia(sextaSanta))
  CACHE_FERIADOS_POR_ANO.set(ano, datas)
  return datas
}

/** true para sábado, domingo ou feriado nacional — usado para travar o relógio do SLA nesses dias
 * (ver `horasUteisDecorridas` em chamadoMetrics.ts). */
export function isFimDeSemanaOuFeriado(data: Date): boolean {
  const diaSemana = data.getDay()
  if (diaSemana === 0 || diaSemana === 6) return true
  return feriadosDoAno(data.getFullYear()).has(chaveDoDia(data))
}
