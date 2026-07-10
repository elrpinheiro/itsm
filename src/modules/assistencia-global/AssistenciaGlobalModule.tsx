import { useState } from 'react'
import ChamadosScreen from './ChamadosScreen'
import FormulariosScreen from './FormulariosScreen'
import { useModuleAccess } from '@/store/usePermissions'

type Tab = 'chamados' | 'formularios'

export default function AssistenciaGlobalModule() {
  const acesso = useModuleAccess('assistencia')
  const [tab, setTab] = useState<Tab>('chamados')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'chamados', label: acesso.ver === 'proprios' ? 'Meus chamados' : 'Chamados' },
    ...(acesso.criar ? [{ key: 'formularios' as const, label: 'Formulários' }] : []),
  ]

  return (
    <div className="mod-page">
      <div className="mod-page-tabs">
        {tabs.map((t) => (
          <span key={t.key} className={`chip${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="mod-page-body">{tab === 'chamados' || !acesso.criar ? <ChamadosScreen /> : <FormulariosScreen />}</div>
    </div>
  )
}
