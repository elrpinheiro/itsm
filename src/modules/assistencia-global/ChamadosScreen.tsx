import { Plus } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useChamadosStore } from '@/store/useChamadosStore'
import FilaChamadosList from '../assistencia/FilaChamadosList'

interface Props {
  onNovoAtendimento: () => void
  onOpenChamado: (numero: string) => void
}

export default function ChamadosScreen({ onNovoAtendimento, onOpenChamado }: Props) {
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const todosChamados = useChamadosStore((s) => s.chamados)
  const chamados = todosChamados.filter((c) => acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email)

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
      <FilaChamadosList chamados={chamados} onOpenChamado={onOpenChamado} showProjeto />
    </div>
  )
}
