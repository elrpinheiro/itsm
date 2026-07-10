import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import DocumentosGlobalModule from '../documentos-global/DocumentosGlobalModule'
import BaseConhecimentoGlobalModule from '../base-conhecimento-global/BaseConhecimentoGlobalModule'
import { useModuleAccess } from '@/store/usePermissions'

export default function FerramentasGlobalModule() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeTab = location.pathname.startsWith('/ferramentas/base-conhecimento') ? 'conhecimento' : 'documentos'

  const podeDocumentos = useModuleAccess('documentos').ver !== 'nenhum'
  const podeConhecimento = useModuleAccess('baseConhecimento').ver !== 'nenhum'
  const defaultTab = podeDocumentos ? 'documentos' : 'base-conhecimento'

  return (
    <div className="mod-page">
      <div className="mod-page-tabs">
        {podeDocumentos && (
          <span
            className={`chip${activeTab === 'documentos' ? ' on' : ''}`}
            onClick={() => navigate('/ferramentas/documentos')}
          >
            📁 Central de Documentos
          </span>
        )}
        {podeConhecimento && (
          <span
            className={`chip${activeTab === 'conhecimento' ? ' on' : ''}`}
            onClick={() => navigate('/ferramentas/base-conhecimento')}
          >
            📚 Base de Conhecimento
          </span>
        )}
      </div>
      <div className="mod-page-body">
        <Routes>
          <Route index element={<Navigate to={defaultTab} replace />} />
          {podeDocumentos && <Route path="documentos/*" element={<DocumentosGlobalModule />} />}
          {podeConhecimento && <Route path="base-conhecimento" element={<BaseConhecimentoGlobalModule />} />}
        </Routes>
      </div>
    </div>
  )
}
