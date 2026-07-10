import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CHAMADOS, type Chamado, type OrigemAtendimento, type Prioridade, type StatusChamado } from '@/data/chamados'
import type { ClassificationLabel } from '@/data/catalog'

export interface AddChamadoInput {
  projetoNome: string
  assunto: string
  prioridade: Prioridade
  descricao: string
  solicitanteEmail: string
  categoria: string
  tipoAtendimento: ClassificationLabel
  grupoId: string
  origem: OrigemAtendimento
  vinculados: string[]
  /** true = "Chamado solucionado? Sim" — fecha na hora com a ação como resolução. */
  resolvidoNaHora: boolean
  acaoRealizada?: string
}

interface ChamadosState {
  chamados: Chamado[]
  addChamado: (input: AddChamadoInput) => string
}

function proximoNumero(chamados: Chamado[]): string {
  const maior = chamados.reduce((max, c) => {
    const n = parseInt(c.numero.replace('#', ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 10000)
  return `#${maior + 1}`
}

/** Fila de chamados do sistema — inclui o catálogo mockado inicial e os chamados abertos em sessão via o fluxo de Novo Chamado. */
export const useChamadosStore = create<ChamadosState>()(
  persist(
    (set, get) => ({
      chamados: CHAMADOS,
      addChamado: (input) => {
        const numero = proximoNumero(get().chamados)
        const status: StatusChamado = input.resolvidoNaHora ? 'Fechado' : 'Na fila'
        const chamado: Chamado = {
          numero,
          projetoNome: input.projetoNome,
          assunto: input.descricao.slice(0, 80),
          prioridade: input.prioridade,
          status,
          abertoHa: 'agora mesmo',
          solicitanteEmail: input.solicitanteEmail,
          categoria: input.categoria,
          tipoAtendimento: input.tipoAtendimento,
          grupoId: input.grupoId,
          origem: input.origem,
          descricao: input.descricao,
          acaoRealizada: input.acaoRealizada || undefined,
          vinculados: input.vinculados.length ? input.vinculados : undefined,
        }
        set((s) => ({ chamados: [...s.chamados, chamado] }))
        return numero
      },
    }),
    { name: 'itsm-chamados-v1' },
  ),
)
