import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ChamadosScreen from './ChamadosScreen'
import NovoAtendimentoView from '../assistencia/NovoAtendimentoView'
import ChamadoDetalheView from '../assistencia/ChamadoDetalheView'
import type { FiltroTab } from '../assistencia/FilaChamadosList'

/** Lê os parâmetros de um deep-link vindo de um KPI do Painel Geral ("?tab=novos",
 * "?prioridade=critica", "?abrir=%2310240") uma única vez, na montagem, e limpa a URL em seguida —
 * o estado (aba/filtro/chamado aberto) passa a viver só no componente a partir daí. */
export default function AssistenciaGlobalModule() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [novoAtendimentoAberto, setNovoAtendimentoAberto] = useState(false)
  const [chamadoAberto, setChamadoAberto] = useState<string | null>(() => searchParams.get('abrir'))
  const [initialTab] = useState<FiltroTab | undefined>(() => (searchParams.get('tab') as FiltroTab) || undefined)
  const [apenasCriticos, setApenasCriticos] = useState(() => searchParams.get('prioridade') === 'critica')

  useEffect(() => {
    if (searchParams.toString()) setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="mod-page">
      <div className="mod-page-body">
        {novoAtendimentoAberto ? (
          <NovoAtendimentoView onClose={() => setNovoAtendimentoAberto(false)} />
        ) : chamadoAberto ? (
          <ChamadoDetalheView numero={chamadoAberto} onClose={() => setChamadoAberto(null)} />
        ) : (
          <ChamadosScreen
            onNovoAtendimento={() => setNovoAtendimentoAberto(true)}
            onOpenChamado={setChamadoAberto}
            initialTab={initialTab}
            apenasCriticos={apenasCriticos}
            onLimparCriticos={() => setApenasCriticos(false)}
          />
        )}
      </div>
    </div>
  )
}
