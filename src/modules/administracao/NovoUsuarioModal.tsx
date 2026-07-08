import { useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { PERFIS, type OrigemUsuario, type Usuario } from '@/data/administracaoMock'

interface Props {
  onClose: () => void
  onCreate: (usuario: Usuario) => void
}

export default function NovoUsuarioModal({ onClose, onCreate }: Props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [perfil, setPerfil] = useState(PERFIS[0]?.nome ?? '')
  const [origem, setOrigem] = useState<OrigemUsuario>('LDAP')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      setError('Informe o nome do usuário.')
      return
    }
    if (!email.trim()) {
      setError('Informe o e-mail do usuário.')
      return
    }
    onCreate({ nome: nome.trim(), email: email.trim(), perfil, origem, status: 'Ativo' })
  }

  return (
    <Modal title="Novo usuário" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="frow">
          <label className="field-label">Nome</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Ana Ferreira" />
        </div>
        <div className="frow">
          <label className="field-label">E-mail</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex.: ana.ferreira@vitaebrasil.com.br"
          />
        </div>
        <div className="frow">
          <label className="field-label">Perfil</label>
          <select value={perfil} onChange={(e) => setPerfil(e.target.value)}>
            {PERFIS.map((p) => (
              <option key={p.nome} value={p.nome}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="frow">
          <label className="field-label">Origem</label>
          <div className="radio-line">
            <label>
              <input type="radio" name="origem" checked={origem === 'LDAP'} onChange={() => setOrigem('LDAP')} />
              LDAP
            </label>
            <label>
              <input type="radio" name="origem" checked={origem === 'Local'} onChange={() => setOrigem('Local')} />
              Local
            </label>
          </div>
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Criar usuário
          </button>
        </div>
      </form>
    </Modal>
  )
}
