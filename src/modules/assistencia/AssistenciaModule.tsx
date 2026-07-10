import { useState } from 'react'
import { useProjectStore } from '@/store/useProjectStore'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import FormulariosCatalogo from '@/components/common/FormulariosCatalogo'
import { CHAMADOS, type Prioridade, type StatusChamado } from '@/data/chamados'
import { PROJECT_CATALOGS } from '@/data/catalog'

type Tab = 'chamados' | 'formularios'

const TABS: { key: Tab; label: string }[] = [
  { key: 'chamados', label: 'Chamados' },
  { key: 'formularios', label: 'Formulários' },
]

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Nº', width: '80px' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'prioridade', label: 'Prioridade', width: '110px' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'abertoHa', label: 'Aberto há', width: '90px' },
]

const PRIORIDADE_CLASS: Record<Prioridade, string> = {
  Baixa: 'badge-blue',
  Média: 'badge-amber',
  Alta: 'badge-amber',
  Crítica: '',
}

const STATUS_CLASS: Record<StatusChamado, string> = {
  'Na fila': 'badge-amber',
  'Em atendimento': 'badge-blue',
  'Aguardando terceiro': '',
}

export default function AssistenciaModule() {
  const project = useProjectStore((s) => s.selectedProject)
  const [tab, setTab] = useState<Tab>('chamados')

  if (!project) return null

  const projetoLabel = `${project.nome} — ${project.cidade}`
  const chamados = CHAMADOS.filter((c) => c.projetoNome === projetoLabel)
  const catalog = PROJECT_CATALOGS[project.id]

  const rows = chamados.map((c) => ({
    numero: <b>{c.numero}</b>,
    assunto: c.assunto,
    prioridade: (
      <span className={`badge ${PRIORIDADE_CLASS[c.prioridade]}`} style={c.prioridade === 'Crítica' ? { background: '#fdeaea', color: '#a30000' } : undefined}>
        {c.prioridade}
      </span>
    ),
    status: (
      <span
        className={`badge ${STATUS_CLASS[c.status]}`}
        style={c.status === 'Aguardando terceiro' ? { background: '#f1efee', color: '#5a4a3f' } : undefined}
      >
        {c.status}
      </span>
    ),
    abertoHa: c.abertoHa,
  }))

  return (
    <div className="mod-page" style={{ height: '100%' }}>
      <div className="mod-page-tabs">
        {TABS.map((t) => (
          <span key={t.key} className={`chip${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="mod-page-body">
        {tab === 'chamados' ? (
          <div className="mod-scroll-area">
            <div className="mod-section-title">Chamados — {project.nome}</div>
            <DataTable columns={COLUMNS} rows={rows} emptyText="Nenhum chamado na fila para este projeto." />
          </div>
        ) : (
          <div className="mod-scroll-area">
            <div className="mod-section-title">Catálogo de formulários — {project.nome}</div>
            <FormulariosCatalogo catalog={catalog} contextLabel={project.nome} />
          </div>
        )}
      </div>
    </div>
  )
}
