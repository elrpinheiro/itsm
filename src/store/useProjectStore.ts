import { create } from 'zustand'
import type { Project } from '@/types'

interface ProjectState {
  selectedProject: Project | null
  selectProject: (project: Project) => void
  clearProject: () => void
}

/** Projeto/entidade ativa na sessão — selecionada na tela pós-login e usada para tematizar o shell. */
export const useProjectStore = create<ProjectState>((set) => ({
  selectedProject: null,
  selectProject: (project) => set({ selectedProject: project }),
  clearProject: () => set({ selectedProject: null }),
}))
