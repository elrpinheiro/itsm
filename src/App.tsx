import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import LoginScreen from '@/components/login/LoginScreen'
import ProjectSelectionScreen from '@/components/projects/ProjectSelectionScreen'
import AppShell from '@/components/layout/AppShell'
import DocumentosModule from '@/modules/documentos/DocumentosModule'
import AssistenciaModule from '@/modules/assistencia/AssistenciaModule'

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
        path="/projects"
        element={
          <RequireAuth>
            <ProjectSelectionScreen />
          </RequireAuth>
        }
      />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <RequireProject>
              <AppShell />
            </RequireProject>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="documentos" replace />} />
        <Route path="documentos/*" element={<DocumentosModule />} />
        <Route path="assistencia" element={<AssistenciaModule />} />
      </Route>
      <Route path="*" element={<EntryRedirect />} />
    </Routes>
  )
}
