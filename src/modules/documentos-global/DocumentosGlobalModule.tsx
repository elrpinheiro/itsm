import { Route, Routes, useNavigate } from 'react-router-dom'
import DocumentWizard from '../documentos/wizard/DocumentWizard'
import DocumentosBrowser from './DocumentosBrowser'

function DocumentWizardWithBack() {
  const navigate = useNavigate()
  return (
    <div className="main-content">
      <DocumentWizard onBack={() => navigate('/documentos')} />
    </div>
  )
}

export default function DocumentosGlobalModule() {
  return (
    <Routes>
      <Route index element={<DocumentosBrowser />} />
      <Route path=":portfolioId/:templateId/:brandId" element={<DocumentWizardWithBack />} />
    </Routes>
  )
}
