import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import DocumentosModule from '../documentos/DocumentosModule'
import BaseConhecimentoModule from '../base-conhecimento/BaseConhecimentoModule'
import { useModuleAccess } from '@/store/usePermissions'

export default function FerramentasModule() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = location.pathname.startsWith('/app/ferramentas/base-conhecimento') ? 'conhecimento' : 'documentos'

  const podeDocumentos = useModuleAccess('documentos').ver !== 'nenhum'
  const podeConhecimento = useModuleAccess('baseConhecimento').ver !== 'nenhum'
  const defaultTab = podeDocumentos ? 'documentos' : 'base-conhecimento'

  return (
    <div className="mod-page" style={{ height: '100%' }}>
      <div className="mod-page-tabs">
        {podeDocumentos && (
          <span
            className={`chip${activeTab === 'documentos' ? ' on' : ''}`}
            onClick={() => navigate('/app/ferramentas/documentos')}
          >
            📁 Central de Documentos
          </span>
        )}
        {podeConhecimento && (
          <span
            className={`chip${activeTab === 'conhecimento' ? ' on' : ''}`}
            onClick={() => navigate('/app/ferramentas/base-conhecimento')}
          >
            📚 Base de Conhecimento
          </span>
        )}
      </div>
      <div className="mod-page-body">
        <Routes>
          <Route index element={<Navigate to={defaultTab} replace />} />
          {podeDocumentos && (
            <Route
              path="documentos/*"
              element={
                <div className="main-content">
                  <DocumentosModule />
                </div>
              }
            />
          )}
          {podeConhecimento && <Route path="base-conhecimento" element={<BaseConhecimentoModule />} />}
        </Routes>
      </div>
    </div>
  )
}
