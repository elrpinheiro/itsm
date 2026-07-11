import { Headset, Settings, Monitor, Wrench, PenLine, LayoutDashboard, type LucideIcon } from 'lucide-react'

/**
 * Registro central dos módulos do ITSM. Para adicionar um novo módulo,
 * inclua sua entrada aqui e registre a rota correspondente em App.tsx —
 * a aba aparece automaticamente na barra de módulos.
 */
export interface ModuleDef {
  key: string
  path: string
  label: string
  icon: LucideIcon
  /** true = só existe dentro de um projeto (não aparece na barra em visão global). */
  projectOnly?: boolean
}

export const MODULES: ModuleDef[] = [
  { key: 'inicio', path: 'inicio', label: 'Início', icon: LayoutDashboard, projectOnly: true },
  { key: 'assist', path: 'assistencia', label: 'Assistência', icon: Headset },
  { key: 'admin', path: 'administracao', label: 'Administração', icon: Settings },
  { key: 'ativos', path: 'ativos', label: 'Ativos', icon: Monitor },
  { key: 'ferramentas', path: 'ferramentas', label: 'Ferramentas', icon: Wrench },
  { key: 'assinatura', path: 'assinatura-digital', label: 'Assinatura Digital', icon: PenLine },
]
