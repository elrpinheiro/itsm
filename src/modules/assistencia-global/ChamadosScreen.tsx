import { Plus, X } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useChamadosStore } from '@/store/useChamadosStore'
import FilaChamadosList, { type FiltroTab } from '../assistencia/FilaChamadosList'

interface Props {
  onNovoAtendimento: () => void
  onOpenChamado: (numero: string) => void
  /** Aba e filtro de criticidade vindos de um KPI do Painel Geral (ex.: "?tab=novos"). */
  initialTab?: FiltroTab
  apenasCriticos?: boolean
  onLimparCriticos?: () => void
}

export default function ChamadosScreen({ onNovoAtendimento, onOpenChamado, initialTab, apenasCriticos, onLimparCriticos }: Props) {
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const todosChamados = useChamadosStore((s) => s.chamados)
  let chamados = todosChamados.filter((c) => acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email)
  if (apenasCriticos) chamados = chamados.filter((c) => c.prioridade === 'Crítica' && c.status !== 'Fechado')

  return (
    <div className="mod-scroll-area">
      <div className="chd-breadcrumb">Assistência <span>›</span> Fila de chamados</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="mod-section-title" style={{ marginBottom: 0 }}>
          {acesso.ver === 'proprios' ? 'Meus chamados' : 'Fila de chamados'}
        </div>
        {acesso.criar && (
          <button className="btn btn-primary" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }} onClick={onNovoAtendimento}>
            <Plus size={14} /> Novo Atendimento
          </button>
        )}
      </div>
      {apenasCriticos && (
        <div className="filtro-ativo-chip">
          Mostrando: Críticos em aberto
          <button type="button" onClick={onLimparCriticos} aria-label="Limpar filtro">
            <X size={12} />
          </button>
        </div>
      )}
      <FilaChamadosList chamados={chamados} onOpenChamado={onOpenChamado} showProjeto initialTab={initialTab} />
    </div>
  )
}
