import { useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { useAdminStore } from '@/store/useAdminStore'
import { useAllProjects } from '@/store/useCatalogStore'

interface Props {
  onClose: () => void
  /** Entidade (projeto) pré-selecionada quando o cadastro é aberto de dentro de um projeto específico. */
  defaultProjetoId?: string
}

export default function NovoGrupoModal({ onClose, defaultProjetoId }: Props) {
  const addGrupo = useAdminStore((s) => s.addGrupo)
  const projetos = useAllProjects()

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [projetoId, setProjetoId] = useState(defaultProjetoId ?? '')
  const [visivelComoSolicitante, setVisivelComoSolicitante] = useState(false)
  const [visivelComoAtribuicao, setVisivelComoAtribuicao] = useState(true)
  const [podeSerNotificado, setPodeSerNotificado] = useState(true)
  const [error, setError] = useState('')

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!nome.trim()) return setError('Informe o nome do grupo.')
    if (!descricao.trim()) return setError('Informe uma descrição para o grupo.')
    addGrupo({
      nome,
      descricao,
      projetoId: projetoId || undefined,
      visivelComoSolicitante,
      visivelComoAtribuicao,
      podeSerNotificado,
    })
    onClose()
  }

  return (
    <Modal title="Novo grupo" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="frow">
          <label className="field-label">Nome do grupo (departamento)</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: TIC" />
        </div>
        <div className="frow">
          <label className="field-label">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Suporte técnico de TI da unidade"
          />
        </div>
        <div className="frow">
          <label className="field-label">Entidade (projeto)</label>
          <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
            <option value="">Sem entidade (grupo global)</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.cidade}
              </option>
            ))}
          </select>
        </div>
        <div className="frow">
          <label className="field-label">Comportamento no chamado</label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12.5 }}>
            <input type="checkbox" checked={visivelComoSolicitante} onChange={(e) => setVisivelComoSolicitante(e.target.checked)} style={{ width: 'auto' }} />
            Visível como grupo solicitante
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, fontSize: 12.5 }}>
            <input type="checkbox" checked={visivelComoAtribuicao} onChange={(e) => setVisivelComoAtribuicao(e.target.checked)} style={{ width: 'auto' }} />
            Visível para atribuição de chamados
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12.5 }}>
            <input type="checkbox" checked={podeSerNotificado} onChange={(e) => setPodeSerNotificado(e.target.checked)} style={{ width: 'auto' }} />
            Pode ser notificado
          </label>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
            Criar grupo
          </button>
        </div>
      </form>
    </Modal>
  )
}
