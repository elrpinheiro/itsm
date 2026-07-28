import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DropdownTipo = 'prioridade' | 'status' | 'origem'

export interface DropdownEntry {
  /** Chave interna fixa — usada por SLA, gráficos e regras de negócio. Não é editável (evita quebrar
   * essas referências); só rótulo, cor e ativo/inativo são administráveis, no espírito do GLPI. */
  chave: string
  label: string
  cor: string
  ativo: boolean
  ordem: number
}

const PRIORIDADE_PADRAO: DropdownEntry[] = [
  { chave: 'Baixa', label: 'Baixa', cor: '#0c447c', ativo: true, ordem: 0 },
  { chave: 'Média', label: 'Média', cor: '#633806', ativo: true, ordem: 1 },
  { chave: 'Alta', label: 'Alta', cor: '#633806', ativo: true, ordem: 2 },
  { chave: 'Crítica', label: 'Crítica', cor: '#a30000', ativo: true, ordem: 3 },
]

const STATUS_PADRAO: DropdownEntry[] = [
  { chave: 'Na fila', label: 'Novo', cor: '#854f0b', ativo: true, ordem: 0 },
  { chave: 'Em atendimento', label: 'Processando (atribuído)', cor: '#185fa5', ativo: true, ordem: 1 },
  { chave: 'Processando (planejado)', label: 'Processando (planejado)', cor: '#6a3fa0', ativo: true, ordem: 2 },
  { chave: 'Aguardando terceiro', label: 'Pendente', cor: '#8b8f83', ativo: true, ordem: 3 },
  { chave: 'Pendente Fornecedor', label: 'Pendente Fornecedor', cor: '#8a5a12', ativo: true, ordem: 4 },
  { chave: 'Pendente Cliente/Colaborador', label: 'Pendente Cliente/Colaborador', cor: '#6f6a12', ativo: true, ordem: 5 },
  { chave: 'Solucionado', label: 'Solucionado', cor: '#0f7a72', ativo: true, ordem: 6 },
  { chave: 'Fechado', label: 'Fechado', cor: '#3b6d11', ativo: true, ordem: 7 },
]

const ORIGEM_PADRAO: DropdownEntry[] = [
  { chave: 'Atendente', label: 'Atendente', cor: '#185fa5', ativo: true, ordem: 0 },
  { chave: '0800 (URA)', label: '0800 (URA)', cor: '#633806', ativo: true, ordem: 1 },
  { chave: 'WhatsApp', label: 'WhatsApp', cor: '#3b6d11', ativo: true, ordem: 2 },
]

interface DropdownsState {
  prioridade: DropdownEntry[]
  status: DropdownEntry[]
  origem: DropdownEntry[]
  updateEntry: (tipo: DropdownTipo, chave: string, patch: Partial<Pick<DropdownEntry, 'label' | 'cor' | 'ativo'>>) => void
}

/** Listas suspensas do sistema (Prioridade, Status do chamado, Origem do atendimento), no mesmo
 * espírito do módulo "Listas suspensas" do GLPI: rótulo, cor e ativo/inativo são administráveis pelo
 * time do cliente; a chave interna é fixa (é o que SLA, gráficos e badges usam para não quebrar). */
export const useDropdownsStore = create<DropdownsState>()(
  persist(
    (set) => ({
      prioridade: PRIORIDADE_PADRAO,
      status: STATUS_PADRAO,
      origem: ORIGEM_PADRAO,
      updateEntry: (tipo, chave, patch) =>
        set((s) => ({ [tipo]: s[tipo].map((e) => (e.chave === chave ? { ...e, ...patch } : e)) }) as Partial<DropdownsState>),
    }),
    { name: 'itsm-dropdowns-v4' },
  ),
)

/** Entradas de uma lista suspensa, ordenadas — inclui inativas (quem lista para exibir precisa
 * filtrar por `ativo` conforme o caso: telas de administração mostram todas, seletores de novo
 * chamado mostram só as ativas). */
export function useDropdownEntries(tipo: DropdownTipo): DropdownEntry[] {
  return useDropdownsStore((s) => [...s[tipo]].sort((a, b) => a.ordem - b.ordem))
}
