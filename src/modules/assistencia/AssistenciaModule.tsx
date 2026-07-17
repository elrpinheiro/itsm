import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjectStore } from '@/store/useProjectStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useChamadosStore } from '@/store/useChamadosStore'
import NovoAtendimentoView from './NovoAtendimentoView'
import ChamadoDetalheView from './ChamadoDetalheView'
import FilaChamadosList from './FilaChamadosList'

export default function AssistenciaModule() {
  const project = useProjectStore((s) => s.selectedProject)
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const todosChamados = useChamadosStore((s) => s.chamados)
  const [novoAtendimentoAberto, setNovoAtendimentoAberto] = useState(false)
  const [chamadoAberto, setChamadoAberto] = useState<string | null>(null)

  if (!project) return null

  const projetoLabel = `${project.nome} — ${project.cidade}`
  const chamados = todosChamados.filter(
    (c) => c.projetoNome === projetoLabel && (acesso.ver !== 'proprios' || c.solicitanteEmail === user?.email),
  )

  return (
    <div className="mod-page" style={{ height: '100%' }}>
      <div className="mod-page-body">
        {novoAtendimentoAberto ? (
          <NovoAtendimentoView project={project} onClose={() => setNovoAtendimentoAberto(false)} />
        ) : chamadoAberto ? (
          <ChamadoDetalheView numero={chamadoAberto} onClose={() => setChamadoAberto(null)} />
        ) : (
          <div className="mod-scroll-area">
            <div className="chd-breadcrumb">Assistência <span>›</span> Fila de chamados</div>
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
            <FilaChamadosList chamados={chamados} onOpenChamado={setChamadoAberto} />
          </div>
        )}
      </div>
    </div>
  )
}
