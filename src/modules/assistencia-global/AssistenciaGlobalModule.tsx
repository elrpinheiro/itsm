import { useState } from 'react'
import ChamadosScreen from './ChamadosScreen'
import NovoAtendimentoView from '../assistencia/NovoAtendimentoView'

export default function AssistenciaGlobalModule() {
  const [novoAtendimentoAberto, setNovoAtendimentoAberto] = useState(false)

  return (
    <div className="mod-page">
      <div className="mod-page-body">
        {novoAtendimentoAberto ? (
          <NovoAtendimentoView onClose={() => setNovoAtendimentoAberto(false)} />
        ) : (
          <ChamadosScreen onNovoAtendimento={() => setNovoAtendimentoAberto(true)} />
        )}
      </div>
    </div>
  )
}
