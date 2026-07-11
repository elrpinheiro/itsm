import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Prioridade } from '@/data/chamados'

export interface SlaEntry {
  prioridade: Prioridade
  /** Time To Own — prazo-alvo (horas) até um técnico assumir o chamado. Ainda não medido
   * automaticamente: o sistema não registra o instante em que um técnico assume um chamado, então
   * este valor é só a política configurada (referência), sem um "TTO cumprido" calculado hoje. */
  tto: number
  /** Time To Resolve — prazo-alvo (horas) até o chamado ser resolvido. É o valor realmente usado
   * pelo cálculo de "SLA cumprido" em chamadoMetrics.ts, a partir do tempo decorrido em "abertoHa". */
  ttr: number
}

/** Política padrão de fábrica — mesmos valores de TTR usados antes desta tela existir; TTO é uma
 * referência inicial (25% do TTR), ajustável pelo administrador em Administração → Níveis de Serviço. */
const SLA_PADRAO: SlaEntry[] = [
  { prioridade: 'Crítica', tto: 1, ttr: 4 },
  { prioridade: 'Alta', tto: 2, ttr: 8 },
  { prioridade: 'Média', tto: 6, ttr: 24 },
  { prioridade: 'Baixa', tto: 18, ttr: 72 },
]

interface SlaState {
  entradas: SlaEntry[]
  updateSla: (prioridade: Prioridade, patch: Partial<Pick<SlaEntry, 'tto' | 'ttr'>>) => void
}

/** Níveis de serviço (SLA) por prioridade — no espírito do módulo "Níveis de serviço" do GLPI:
 * TTO (Time To Own) e TTR (Time To Resolve) configuráveis pelo administrador, em vez de fixos no
 * código. GLPI também associa um calendário de expediente ao SLA; este sistema ainda não tem — o
 * cálculo em chamadoMetrics.ts trata o tempo decorrido como corrido (24×7), sem pausar em fins de
 * semana/feriados/status pendente. */
export const useSlaStore = create<SlaState>()(
  persist(
    (set) => ({
      entradas: SLA_PADRAO,
      updateSla: (prioridade, patch) =>
        set((s) => ({ entradas: s.entradas.map((e) => (e.prioridade === prioridade ? { ...e, ...patch } : e)) })),
    }),
    { name: 'itsm-sla-v1' },
  ),
)

export function useSlaEntries(): SlaEntry[] {
  return useSlaStore((s) => s.entradas)
}

/** Mapa Prioridade → TTR (horas), no formato que `calcularSla` espera. */
export function useSlaTtrMap(): Record<Prioridade, number> {
  const entradas = useSlaEntries()
  return Object.fromEntries(entradas.map((e) => [e.prioridade, e.ttr])) as Record<Prioridade, number>
}
