import { useState } from 'react'
import { useProjectStore } from '@/store/useProjectStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useChamadosStore } from '@/store/useChamadosStore'
import { type Prioridade, type StatusChamado } from '@/data/chamados'
import NovoAtendimentoView from './NovoAtendimentoView'

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
  Fechado: 'badge-green',
}

export default function AssistenciaModule() {
  const project = useProjectStore((s) => s.selectedProject)
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const todosChamados = useChamadosStore((s) => s.chamados)
  const [novoAtendimentoAberto, setNovoAtendimentoAberto] = useState(false)

  if (!project) return null

  const projetoLabel = `${project.nome} — ${project.cidade}`
  const chamados = todosChamados.filter(
    (c) => c.projetoNome === projetoLabel && (acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email),
  )

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
      <div className="mod-page-body">
        {novoAtendimentoAberto ? (
          <NovoAtendimentoView project={project} onClose={() => setNovoAtendimentoAberto(false)} />
        ) : (
          <div className="mod-scroll-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                {acesso.ver === 'proprios' ? 'Meus chamados' : 'Chamados'} — {project.nome}
              </div>
              {acesso.criar && (
                <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }} onClick={() => setNovoAtendimentoAberto(true)}>
                  + Novo Atendimento
                </button>
              )}
            </div>
            <DataTable columns={COLUMNS} rows={rows} emptyText="Nenhum chamado na fila para este projeto." />
          </div>
        )}
      </div>
    </div>
  )
}
