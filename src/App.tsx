import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import LoginScreen from '@/components/login/LoginScreen'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import ProjectSelectionScreen from '@/components/projects/ProjectSelectionScreen'
import AppShell from '@/components/layout/AppShell'
import DocumentosModule from '@/modules/documentos/DocumentosModule'
import AssistenciaModule from '@/modules/assistencia/AssistenciaModule'
import AssistenciaGlobalModule from '@/modules/assistencia-global/AssistenciaGlobalModule'
import AdministracaoModule from '@/modules/administracao/AdministracaoModule'
import AtivosModule from '@/modules/ativos/AtivosModule'
import DocumentosGlobalModule from '@/modules/documentos-global/DocumentosGlobalModule'
import BaseConhecimentoModule from '@/modules/base-conhecimento/BaseConhecimentoModule'
import BaseConhecimentoGlobalModule from '@/modules/base-conhecimento-global/BaseConhecimentoGlobalModule'

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

function RequireProject({ children }: { children: JSX.Element }) {
  const project = useProjectStore((s) => s.selectedProject)
  if (!project) return <Navigate to="/projects" replace />
  return children
}

function EntryRedirect() {
  const user = useAuthStore((s) => s.user)
  const project = useProjectStore((s) => s.selectedProject)
  if (!user) return <Navigate to="/login" replace />
  if (!project) return <Navigate to="/projects" replace />
  return <Navigate to="/app" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        element={
          <RequireAuth>
            <AuthenticatedLayout />
          </RequireAuth>
        }
      >
        <Route path="/projects" element={<ProjectSelectionScreen />} />
        <Route path="/assistencia" element={<AssistenciaGlobalModule />} />
        <Route path="/administracao" element={<AdministracaoModule />} />
        <Route path="/ativos" element={<AtivosModule />} />
        <Route path="/documentos/*" element={<DocumentosGlobalModule />} />
        <Route path="/base-conhecimento" element={<BaseConhecimentoGlobalModule />} />
        <Route
          path="/app"
          element={
            <RequireProject>
              <AppShell />
            </RequireProject>
          }
        >
          <Route index element={<Navigate to="documentos" replace />} />
          <Route path="documentos/*" element={<DocumentosModule />} />
          <Route path="assistencia" element={<AssistenciaModule />} />
          <Route path="administracao" element={<AdministracaoModule />} />
          <Route path="ativos" element={<AtivosModule />} />
          <Route path="base-conhecimento" element={<BaseConhecimentoModule />} />
        </Route>
      </Route>
      <Route path="*" element={<EntryRedirect />} />
    </Routes>
  )
}
