import { useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { useAdminStore } from '@/store/useAdminStore'

interface Props {
  onClose: () => void
}

export default function NovoGrupoModal({ onClose }: Props) {
  const addGrupo = useAdminStore((s) => s.addGrupo)

  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [visivelComoSolicitante, setVisivelComoSolicitante] = useState(false)
  const [visivelComoAtribuicao, setVisivelComoAtribuicao] = useState(true)
  const [podeSerNotificado, setPodeSerNotificado] = useState(true)
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return setError('Informe o nome do grupo.')
    if (!descricao.trim()) return setError('Informe uma descrição para o grupo.')
    addGrupo({ nome, descricao, visivelComoSolicitante, visivelComoAtribuicao, podeSerNotificado })
    onClose()
  }

  return (
    <Modal title="Novo grupo" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="frow">
          <label className="field-label">Nome do grupo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: TIC — Suporte N3" />
        </div>
        <div className="frow">
          <label className="field-label">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex.: Chamados críticos de infraestrutura"
          />
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
          <button type="submit" className="btn btn-primary">
            Criar grupo
          </button>
        </div>
      </form>
    </Modal>
  )
}
