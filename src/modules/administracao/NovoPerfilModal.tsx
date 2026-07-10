import { useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { useAdminStore } from '@/store/useAdminStore'
import { useAllProjects } from '@/store/useCatalogStore'

interface Props {
  onClose: () => void
  onCreated: (perfilId: string) => void
  /** Entidade (projeto) pré-selecionada quando o cadastro é aberto de dentro de um projeto específico. */
  defaultProjetoId?: string
}

/** Cria um perfil novo com a matriz zerada (tudo "Nenhum") — configure os módulos dele na tela seguinte. */
export default function NovoPerfilModal({ onClose, onCreated, defaultProjetoId }: Props) {
  const addPerfil = useAdminStore((s) => s.addPerfil)
  const projetos = useAllProjects()

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [projetoId, setProjetoId] = useState(defaultProjetoId ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return setError('Informe o nome do perfil.')
    if (!descricao.trim()) return setError('Informe uma descrição para o perfil.')
    const id = addPerfil({ nome, descricao, projetoId: projetoId || undefined })
    onCreated(id)
  }

  return (
    <Modal title="Novo perfil" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="frow">
          <label className="field-label">Nome do perfil</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Coordenador Regional" />
        </div>
        <div className="frow">
          <label className="field-label">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Acompanha chamados e documentos de várias unidades"
          />
        </div>
        <div className="frow">
          <label className="field-label">Entidade (projeto)</label>
          <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
            <option value="">Sem entidade (perfil global — disponível para todos os projetos)</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.cidade}
              </option>
            ))}
          </select>
        </div>
        <div className="hint-txt">
          O perfil nasce sem nenhum acesso — na tela seguinte, marque módulo por módulo o que ele pode ver,
          criar e editar.
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Criar perfil
          </button>
        </div>
      </form>
    </Modal>
  )
}
