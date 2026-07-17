import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { badgeStyleFromColor } from '@/utils/color'
import NovoAtendimentoView from './NovoAtendimentoView'
import ChamadoDetalheView from './ChamadoDetalheView'

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Nº', width: '80px' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'prioridade', label: 'Prioridade', width: '110px' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'abertoHa', label: 'Aberto há', width: '90px' },
]

export default function AssistenciaModule() {
  const project = useProjectStore((s) => s.selectedProject)
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const todosChamados = useChamadosStore((s) => s.chamados)
  const [novoAtendimentoAberto, setNovoAtendimentoAberto] = useState(false)
  const [chamadoAberto, setChamadoAberto] = useState<string | null>(null)
  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))

  if (!project) return null

  const projetoLabel = `${project.nome} — ${project.cidade}`
  const chamados = todosChamados.filter(
    (c) => c.projetoNome === projetoLabel && (acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email),
  )

  const rows = chamados.map((c) => ({
    numero: <b>{c.numero}</b>,
    assunto: c.assunto,
    prioridade: (
      <span className="badge" style={badgeStyleFromColor(prioridadeMap[c.prioridade]?.cor ?? '#5f5e5a')}>
        {prioridadeMap[c.prioridade]?.label ?? c.prioridade}
      </span>
    ),
    status: (
      <span className="badge" style={badgeStyleFromColor(statusMap[c.status]?.cor ?? '#5f5e5a')}>
        {statusMap[c.status]?.label ?? c.status}
      </span>
    ),
    abertoHa: c.abertoHa,
  }))

  return (
    <div className="mod-page" style={{ height: '100%' }}>
      <div className="mod-page-body">
        {novoAtendimentoAberto ? (
          <NovoAtendimentoView project={project} onClose={() => setNovoAtendimentoAberto(false)} />
        ) : chamadoAberto ? (
          <ChamadoDetalheView numero={chamadoAberto} onClose={() => setChamadoAberto(null)} />
        ) : (
          <div className="mod-scroll-area">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                {acesso.ver === 'proprios' ? 'Meus chamados' : 'Chamados'} — {project.nome}
              </div>
              {acesso.criar && (
                <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }} onClick={() => setNovoAtendimentoAberto(true)}>
                  <Plus size={14} /> Novo Atendimento
                </button>
              )}
            </div>
            <DataTable
              columns={COLUMNS}
              rows={rows}
              onRowClick={(i) => setChamadoAberto(chamados[i].numero)}
              rowStripeColor={(i) => prioridadeMap[chamados[i].prioridade]?.cor}
              emptyText="Nenhum chamado na fila para este projeto."
            />
          </div>
        )}
      </div>
    </div>
  )
}
