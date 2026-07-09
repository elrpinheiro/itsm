import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import DocumentosModule from '../documentos/DocumentosModule'
import BaseConhecimentoModule from '../base-conhecimento/BaseConhecimentoModule'

export default function FerramentasModule() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = location.pathname.startsWith('/app/ferramentas/base-conhecimento') ? 'conhecimento' : 'documentos'

  return (
    <div className="mod-page" style={{ height: '100%' }}>
      <div className="mod-page-tabs">
        <span
          className={`chip${activeTab === 'documentos' ? ' on' : ''}`}
          onClick={() => navigate('/app/ferramentas/documentos')}
        >
          📁 Central de Documentos
        </span>
        <span
          className={`chip${activeTab === 'conhecimento' ? ' on' : ''}`}
          onClick={() => navigate('/app/ferramentas/base-conhecimento')}
        >
          📚 Base de Conhecimento
        </span>
      </div>
      <div className="mod-page-body">
        <Routes>
          <Route index element={<Navigate to="documentos" replace />} />
          <Route path="documentos/*" element={<DocumentosModule />} />
          <Route path="base-conhecimento" element={<BaseConhecimentoModule />} />
        </Routes>
      </div>
    </div>
  )
}
