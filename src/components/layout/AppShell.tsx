import type { CSSProperties } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { PROJECT_THEMES } from '@/data/projectThemes'
import TopBar from './TopBar'
import ModuleTabs from './ModuleTabs'

export default function AppShell() {
  const project = useProjectStore((s) => s.selectedProject)
  if (!project) return <Navigate to="/projects" replace />

  const theme = PROJECT_THEMES[project.brandId]
  const themeVars = {
    '--tema-escuro': theme.escuro,
    '--tema': theme.medio,
    '--tema-pale': theme.pale,
    '--tema-texto': theme.texto,
    '--tema-accento': theme.accento,
  } as CSSProperties

  return (
    <div className="itsm active" style={themeVars}>
      <div className="main-area">
        <TopBar />
        <ModuleTabs />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
