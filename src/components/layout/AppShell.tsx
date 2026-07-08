import { Navigate, Outlet } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import ModuleTabs from './ModuleTabs'

/**
 * Conteúdo específico de "dentro de um projeto" (abas de módulo + área principal).
 * O cabeçalho, o tema de cores e os painéis de operação já são fornecidos pelo
 * AuthenticatedLayout, que envolve esta rota.
 */
export default function AppShell() {
  const project = useProjectStore((s) => s.selectedProject)
  if (!project) return <Navigate to="/projects" replace />

  return (
    <>
      <ModuleTabs />
      <div className="main-content">
        <Outlet />
      </div>
    </>
  )
}
