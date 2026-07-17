import { useState } from 'react'
import ChamadosScreen from './ChamadosScreen'
import NovoAtendimentoView from '../assistencia/NovoAtendimentoView'
import ChamadoDetalheView from '../assistencia/ChamadoDetalheView'

export default function AssistenciaGlobalModule() {
  const [novoAtendimentoAberto, setNovoAtendimentoAberto] = useState(false)
  const [chamadoAberto, setChamadoAberto] = useState<string | null>(null)

  return (
    <div className="mod-page">
      <div className="mod-page-body">
        {novoAtendimentoAberto ? (
          <NovoAtendimentoView onClose={() => setNovoAtendimentoAberto(false)} />
        ) : chamadoAberto ? (
          <ChamadoDetalheView numero={chamadoAberto} onClose={() => setChamadoAberto(null)} />
        ) : (
          <ChamadosScreen onNovoAtendimento={() => setNovoAtendimentoAberto(true)} onOpenChamado={setChamadoAberto} />
        )}
      </div>
    </div>
  )
}
