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

/** Projeto sem política de SLA por enquanto — ConectaOZ ainda está em fase de validação. */
const PROJETO_SEM_SLA = 'osasco-conectaoz'

/** Política solicitada pela gestão (2026-07) para P1–P4. Os campos são um único número (horas),
 * então usamos o limite superior de cada faixa "típica" como o prazo-alvo configurado (ex.: resposta
 * "15 a 30 min" → tto = 0,5h); dias úteis foram convertidos em horas corridas (1 dia útil = 24h), já
 * que o cálculo em chamadoMetrics.ts ainda não tem calendário de expediente. */
const POLITICA_PADRAO: Record<Prioridade, { tto: number; ttr: number }> = {
  Crítica: { tto: 0.5, ttr: 4 }, // P1 — resposta 15–30min, resolução até 4h (24x7)
  Alta: { tto: 1, ttr: 8 }, // P2 — resposta 30min–1h, resolução 8h (1 dia útil)
  Média: { tto: 4, ttr: 48 }, // P3 — resposta 2–4h, resolução 24–48h (1–2 dias úteis)
  Baixa: { tto: 24, ttr: 120 }, // P4 — resposta 8h–1 dia útil, resolução 3–5 dias úteis
}

/** Política padrão de fábrica — aplicada a todos os projetos de fábrica, exceto o ConectaOZ —
 * Osasco (PROJETO_SEM_SLA), ajustável pelo administrador em Administração → Níveis de Serviço. */
const SLA_PADRAO: SlaEntry[] = PROJECTS.filter((p) => p.id !== PROJETO_SEM_SLA).flatMap((p) =>
  (Object.keys(POLITICA_PADRAO) as Prioridade[]).map((prioridade) => ({
    projetoId: p.id,
    prioridade,
    ...POLITICA_PADRAO[prioridade],
  })),
)

interface SlaState {
  entradas: SlaEntry[]
  updateSla: (projetoId: string, prioridade: Prioridade, patch: Partial<Pick<SlaEntry, 'tto' | 'ttr'>>) => void
}

/** Níveis de serviço (SLA) por projeto e prioridade — no espírito do módulo "Níveis de serviço" do
 * GLPI: TTO (Time To Own) e TTR (Time To Resolve) configuráveis pelo administrador, por entidade, em
 * vez de fixos no código. GLPI também associa um calendário de expediente ao SLA; este sistema ainda
 * não tem — o cálculo em chamadoMetrics.ts trata o tempo decorrido como corrido (24×7), sem pausar em
 * fins de semana/feriados/status pendente. Um projeto sem nenhuma entrada (ex.: ConectaOZ, ainda em
 * validação) fica de fora do cálculo de "SLA cumprido" em vez de herdar uma política de outro projeto. */
export const useSlaStore = create<SlaState>()(
  persist(
    (set) => ({
      entradas: SLA_PADRAO,
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
    }),
    { name: 'itsm-sla-v2' },
  ),
)

/** Entradas de SLA — de um projeto só (quando `projetoId` é informado) ou de todos. */
export function useSlaEntries(projetoId?: string): SlaEntry[] {
  const entradas = useSlaStore((s) => s.entradas)
  return projetoId ? entradas.filter((e) => e.projetoId === projetoId) : entradas
}

/** Mapa Prioridade → TTR (horas) de um projeto — vazio se o projeto ainda não tem SLA configurado
 * (ex.: ConectaOZ — Osasco, em validação), no formato que `calcularSla` espera. */
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
