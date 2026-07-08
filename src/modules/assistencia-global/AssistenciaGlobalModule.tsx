import { useState } from 'react'
import ChamadosScreen from './ChamadosScreen'
import FormulariosScreen from './FormulariosScreen'

type Tab = 'chamados' | 'formularios'

const TABS: { key: Tab; label: string }[] = [
  { key: 'chamados', label: 'Chamados' },
  { key: 'formularios', label: 'Formulários' },
]

export default function AssistenciaGlobalModule() {
  const [tab, setTab] = useState<Tab>('chamados')

  return (
    <div className="mod-page">
      <div className="mod-page-tabs">
        {TABS.map((t) => (
          <span key={t.key} className={`chip${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="mod-page-body">{tab === 'chamados' ? <ChamadosScreen /> : <FormulariosScreen />}</div>
    </div>
  )
}
