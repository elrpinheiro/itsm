import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import LoginScreen from '@/components/login/LoginScreen'
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout'
import PainelGeralModule from '@/modules/painel-geral/PainelGeralModule'
import AppShell from '@/components/layout/AppShell'
import InicioModule from '@/modules/inicio/InicioModule'
import AssistenciaModule from '@/modules/assistencia/AssistenciaModule'
import AssistenciaGlobalModule from '@/modules/assistencia-global/AssistenciaGlobalModule'
import AdministracaoModule from '@/modules/administracao/AdministracaoModule'
import AtivosModule from '@/modules/ativos/AtivosModule'
import FerramentasModule from '@/modules/ferramentas/FerramentasModule'
import FerramentasGlobalModule from '@/modules/ferramentas-global/FerramentasGlobalModule'
import AssinaturaWizard from '@/modules/assinatura/AssinaturaWizard'
import AssinaturaGlobalModule from '@/modules/assinatura-global/AssinaturaGlobalModule'

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
        <Route path="/projects" element={<PainelGeralModule />} />
        <Route path="/assistencia" element={<AssistenciaGlobalModule />} />
        <Route path="/administracao" element={<AdministracaoModule />} />
        <Route path="/ativos" element={<AtivosModule />} />
        <Route path="/ferramentas/*" element={<FerramentasGlobalModule />} />
        <Route path="/assinatura-digital" element={<AssinaturaGlobalModule />} />
        <Route
          path="/app"
          element={
            <RequireProject>
              <AppShell />
            </RequireProject>
          }
        >
          <Route index element={<Navigate to="inicio" replace />} />
          <Route path="inicio" element={<InicioModule />} />
          <Route path="ferramentas/*" element={<FerramentasModule />} />
          <Route path="assistencia" element={<AssistenciaModule />} />
          <Route path="administracao" element={<AdministracaoModule />} />
          <Route path="ativos" element={<AtivosModule />} />
          <Route path="assinatura-digital" element={<AssinaturaWizard />} />
        </Route>
      </Route>
      <Route path="*" element={<EntryRedirect />} />
    </Routes>
  )
}
