import { useState, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { type OrigemUsuario } from '@/data/administracaoMock'
import { useAdminStore } from '@/store/useAdminStore'

interface Props {
  onClose: () => void
}

export default function NovoUsuarioModal({ onClose }: Props) {
  const perfis = useAdminStore((s) => s.perfis)
  const addUsuario = useAdminStore((s) => s.addUsuario)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [perfilId, setPerfilId] = useState(perfis[0]?.id ?? '')
  const [origem, setOrigem] = useState<OrigemUsuario>('Local')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return setError('Informe o nome do usuário.')
    if (!email.trim()) return setError('Informe o e-mail do usuário.')
    if (!login.trim()) return setError('Informe o login do usuário.')
    if (!senha.trim()) return setError('Informe a senha do usuário.')
    addUsuario({ nome, email, login, senha, perfilId, origem })
    onClose()
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
          <label className="field-label">Login</label>
          <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Ex.: ana.ferreira" />
        </div>
        <div className="frow">
          <label className="field-label">Senha</label>
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
        </div>
        <div className="frow">
          <label className="field-label">Perfil</label>
          <select value={perfilId} onChange={(e) => setPerfilId(e.target.value)}>
            {perfis.map((p) => (
              <option key={p.id} value={p.id}>
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
