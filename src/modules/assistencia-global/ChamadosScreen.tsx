import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { CHAMADOS, type Prioridade, type StatusChamado } from '@/data/chamados'

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Nº', width: '80px' },
  { key: 'projeto', label: 'Projeto' },
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

export default function ChamadosScreen() {
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const chamados = CHAMADOS.filter((c) => acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email)

  const naFila = chamados.filter((c) => c.status === 'Na fila').length
  const emAtendimento = chamados.filter((c) => c.status === 'Em atendimento').length

  const rows = chamados.map((c) => ({
    numero: <b>{c.numero}</b>,
    projeto: c.projetoNome,
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
    <div className="mod-scroll-area">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="mod-section-title" style={{ marginBottom: 0 }}>
          {acesso.ver === 'proprios' ? 'Meus chamados' : 'Fila de chamados'}
        </div>
        <span className="badge badge-amber">{naFila} na fila</span>
        <span className="badge badge-blue">{emAtendimento} em atendimento</span>
      </div>
      <DataTable columns={COLUMNS} rows={rows} emptyText="Nenhum chamado na fila." />
    </div>
  )
}
