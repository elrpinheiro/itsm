import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import LoginScreen from '@/components/login/LoginScreen'
import AppShell from '@/components/layout/AppShell'
import DocumentosModule from '@/modules/documentos/DocumentosModule'
import AssistenciaModule from '@/modules/assistencia/AssistenciaModule'

function RequireAuth({ children }: { children: JSX.Element }) {
  const user = useAuthStore((s) => s.user)
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="documentos" replace />} />
        <Route path="documentos/*" element={<DocumentosModule />} />
        <Route path="assistencia" element={<AssistenciaModule />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  )
}
