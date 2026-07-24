import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Prioridade } from '@/data/chamados'
import { PROJECTS } from '@/data/projects'

export interface SlaEntry {
  projetoId: string
  prioridade: Prioridade
  /** Time To Own — prazo-alvo (horas) até um técnico assumir o chamado. Ainda não medido
   * automaticamente: o sistema não registra o instante em que um técnico assume um chamado, então
   * este valor é só a política configurada (referência), sem um "TTO cumprido" calculado hoje. */
  tto: number
  /** Time To Resolve — prazo-alvo (horas) até o chamado ser resolvido. É o valor realmente usado
   * pelo cálculo de "SLA cumprido" em chamadoMetrics.ts, a partir do tempo decorrido em "abertoHa". */
  ttr: number
}

/** Política solicitada pela gestão (2026-07) para P1–P4. Os campos são um único número (horas),
 * então usamos o limite superior de cada faixa "típica" como o prazo-alvo configurado (ex.: resposta
 * "15 a 30 min" → tto = 0,5h). Para a Baixa, a gestão preferiu manter o TTO/TTR em 24h/120h mesmo
 * com o expediente de 08:00–18:00 que `horasUteisDecorridas` usa para contar o relógio do SLA — ou
 * seja, na prática o prazo real (em dias úteis corridos) fica maior que "3 a 5 dias úteis". */
const POLITICA_PADRAO: Record<Prioridade, { tto: number; ttr: number }> = {
  Crítica: { tto: 0.5, ttr: 4 }, // P1 — resposta 15–30min, resolução até 4h (24x7)
  Alta: { tto: 1, ttr: 8 }, // P2 — resposta 30min–1h, resolução 8h (1 dia útil)
  Média: { tto: 4, ttr: 48 }, // P3 — resposta 2–4h, resolução 24–48h (1–2 dias úteis)
  Baixa: { tto: 24, ttr: 120 }, // P4 — mantido em 24h/120h por preferência da gestão
}

/** Política padrão de fábrica — aplicada a todos os projetos de fábrica, ajustável pelo
 * administrador em Administração → Níveis de Serviço. */
const SLA_PADRAO: SlaEntry[] = PROJECTS.flatMap((p) =>
  (Object.keys(POLITICA_PADRAO) as Prioridade[]).map((prioridade) => ({
    projetoId: p.id,
    prioridade,
    ...POLITICA_PADRAO[prioridade],
  })),
)

/** Meta de cumprimento de SLA (% de chamados dentro do prazo) — regra única para todos os projetos
 * (diferente de TTO/TTR, que são por projeto e prioridade), definida pela gestão em 2026-07. */
const META_PADRAO = 85

/** Meta de backlog (% máximo dos chamados abertos no mês que pode ficar em backlog) — regra única
 * para todos os projetos, definida pela gestão em 2026-07. Diferente da meta de SLA, aqui "dentro da
 * meta" é ficar EM OU ABAIXO do valor, não acima. */
const META_BACKLOG_PADRAO = 10

interface SlaState {
  entradas: SlaEntry[]
  metaPercentual: number
  metaBacklogPercentual: number
  updateSla: (projetoId: string, prioridade: Prioridade, patch: Partial<Pick<SlaEntry, 'tto' | 'ttr'>>) => void
  setMetaPercentual: (valor: number) => void
  setMetaBacklogPercentual: (valor: number) => void
}

/** Níveis de serviço (SLA) por projeto e prioridade — no espírito do módulo "Níveis de serviço" do
 * GLPI: TTO (Time To Own) e TTR (Time To Resolve) configuráveis pelo administrador, por entidade, em
 * vez de fixos no código. O cálculo em chamadoMetrics.ts (`horasUteisDecorridas`) trava o relógio do
 * SLA fora do expediente (08:00–18:00) e em sábados, domingos e feriados nacionais — exceto para
 * chamados Críticos (P1), que mantêm atendimento contínuo 24x7 — mas ainda não pausa enquanto o
 * chamado está "Aguardando terceiro". Um projeto sem nenhuma entrada (ex.: recém-criado pelo admin,
 * antes de ter uma política definida) fica de fora do cálculo de "SLA cumprido" em vez de herdar uma
 * política de outro projeto. */
export const useSlaStore = create<SlaState>()(
  persist(
    (set) => ({
      entradas: SLA_PADRAO,
      metaPercentual: META_PADRAO,
      metaBacklogPercentual: META_BACKLOG_PADRAO,
      updateSla: (projetoId, prioridade, patch) =>
        set((s) => {
          const existe = s.entradas.some((e) => e.projetoId === projetoId && e.prioridade === prioridade)
          if (!existe) {
            return { entradas: [...s.entradas, { projetoId, prioridade, tto: 0, ttr: 0, ...patch }] }
          }
          return {
            entradas: s.entradas.map((e) =>
              e.projetoId === projetoId && e.prioridade === prioridade ? { ...e, ...patch } : e,
            ),
          }
        }),
      setMetaPercentual: (valor) => set({ metaPercentual: valor }),
      setMetaBacklogPercentual: (valor) => set({ metaBacklogPercentual: valor }),
    }),
    { name: 'itsm-sla-v2' },
  ),
)

/** Meta de cumprimento de SLA (%) — mesma regra para todos os projetos, editável em Administração →
 * Níveis de Serviço. */
export function useSlaMeta(): number {
  return useSlaStore((s) => s.metaPercentual)
}

/** Meta de backlog (%) — mesma regra para todos os projetos, editável em Administração → Níveis de
 * Serviço. */
export function useMetaBacklog(): number {
  return useSlaStore((s) => s.metaBacklogPercentual)
}

/** Entradas de SLA — de um projeto só (quando `projetoId` é informado) ou de todos. */
export function useSlaEntries(projetoId?: string): SlaEntry[] {
  const entradas = useSlaStore((s) => s.entradas)
  return projetoId ? entradas.filter((e) => e.projetoId === projetoId) : entradas
}

/** Mapa Prioridade → TTR (horas) de um projeto — vazio se o projeto ainda não tem SLA configurado,
 * no formato que `calcularSla` espera. */
export function useSlaTtrMap(projetoId: string): Partial<Record<Prioridade, number>> {
  const entradas = useSlaEntries(projetoId)
  return Object.fromEntries(entradas.map((e) => [e.prioridade, e.ttr]))
}

/** Mapa projetoId → (Prioridade → TTR), de todos os projetos — usado pelo Painel Geral para resolver
 * o TTR de cada chamado a partir do projeto a que ele pertence, somando todas as unidades. */
export function useSlaTtrMapPorProjeto(): Record<string, Partial<Record<Prioridade, number>>> {
  const entradas = useSlaStore((s) => s.entradas)
  const porProjeto: Record<string, Partial<Record<Prioridade, number>>> = {}
  for (const e of entradas) {
    porProjeto[e.projetoId] ??= {}
    porProjeto[e.projetoId][e.prioridade] = e.ttr
  }
  return porProjeto
}
