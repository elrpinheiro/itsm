import { Plus } from 'lucide-react'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { badgeStyleFromColor } from '@/utils/color'

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Nº', width: '80px' },
  { key: 'projeto', label: 'Projeto' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'prioridade', label: 'Prioridade', width: '110px' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'abertoHa', label: 'Aberto há', width: '90px' },
]

interface Props {
  onNovoAtendimento: () => void
}

export default function ChamadosScreen({ onNovoAtendimento }: Props) {
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const todosChamados = useChamadosStore((s) => s.chamados)
  const chamados = todosChamados.filter((c) => acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email)
  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))

  const naFila = chamados.filter((c) => c.status === 'Na fila').length
  const emAtendimento = chamados.filter((c) => c.status === 'Em atendimento').length

  const rows = chamados.map((c) => ({
    numero: <b>{c.numero}</b>,
    projeto: c.projetoNome,
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
    <div className="mod-scroll-area">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="mod-section-title" style={{ marginBottom: 0 }}>
          {acesso.ver === 'proprios' ? 'Meus chamados' : 'Fila de chamados'}
        </div>
        <span className="badge badge-amber">{naFila} na fila</span>
        <span className="badge badge-blue">{emAtendimento} em atendimento</span>
        {acesso.criar && (
          <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }} onClick={onNovoAtendimento}>
            <Plus size={14} /> Novo Atendimento
          </button>
        )}
      </div>
      <DataTable
        columns={COLUMNS}
        rows={rows}
        rowStripeColor={(i) => prioridadeMap[chamados[i].prioridade]?.cor}
        emptyText="Nenhum chamado na fila."
      />
    </div>
  )
}
