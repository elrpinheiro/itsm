import { useState, type CSSProperties, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { CATEGORIAS_USUARIO, type CategoriaUsuario, type OrigemUsuario } from '@/data/administracaoMock'
import { useAdminStore } from '@/store/useAdminStore'
import { useAllProjects } from '@/store/useCatalogStore'

interface Props {
  onClose: () => void
  /** Entidade (projeto) pré-selecionada quando o cadastro é aberto de dentro de um projeto específico. */
  defaultProjetoId?: string
}

const ROW2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }

export default function NovoUsuarioModal({ onClose, defaultProjetoId }: Props) {
  const perfis = useAdminStore((s) => s.perfis)
  const grupos = useAdminStore((s) => s.grupos)
  const usuarios = useAdminStore((s) => s.usuarios)
  const addUsuario = useAdminStore((s) => s.addUsuario)
  const projetos = useAllProjects()

  const [primeiroNome, setPrimeiroNome] = useState('')
  const [sobrenome, setSobrenome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [celular, setCelular] = useState('')
  const [cargo, setCargo] = useState('')
  const [login, setLogin] = useState('')
  const [senha, setSenha] = useState('')
  const [perfilId, setPerfilId] = useState(perfis[0]?.id ?? '')
  const [origem, setOrigem] = useState<OrigemUsuario>('Local')
  const [categoria, setCategoria] = useState<CategoriaUsuario | ''>('')
  const [projetoId, setProjetoId] = useState(defaultProjetoId ?? '')
  const [grupoId, setGrupoId] = useState('')
  const [supervisorId, setSupervisorId] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!primeiroNome.trim()) return setError('Informe o primeiro nome.')
    if (!sobrenome.trim()) return setError('Informe o sobrenome.')
    if (!email.trim()) return setError('Informe o e-mail do usuário.')
    if (!login.trim()) return setError('Informe o login do usuário.')
    if (!senha.trim()) return setError('Informe a senha do usuário.')
    addUsuario({
      primeiroNome,
      sobrenome,
      email,
      telefone: telefone || undefined,
      celular: celular || undefined,
      cargo: cargo || undefined,
      login,
      senha,
      perfilId,
      origem,
      categoria: categoria || undefined,
      projetoId: projetoId || undefined,
      grupoId: grupoId || undefined,
      supervisorId: supervisorId || undefined,
      comentarios: comentarios || undefined,
    })
    onClose()
  }

  return (
    <Modal title="Novo usuário" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Primeiro nome</label>
            <input type="text" value={primeiroNome} onChange={(e) => setPrimeiroNome(e.target.value)} placeholder="Ex.: Ana" />
          </div>
          <div className="frow">
            <label className="field-label">Sobrenome</label>
            <input type="text" value={sobrenome} onChange={(e) => setSobrenome(e.target.value)} placeholder="Ex.: Ferreira" />
          </div>
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">E-mail</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ana.ferreira@vitaebrasil.com.br" />
          </div>
          <div className="frow">
            <label className="field-label">Cargo</label>
            <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Ex.: Coordenadora Pedagógica" />
          </div>
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 4000-0000" />
          </div>
          <div className="frow">
            <label className="field-label">Celular</label>
            <input type="text" value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="(11) 90000-0000" />
          </div>
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Login</label>
            <input type="text" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="Ex.: ana.ferreira" />
          </div>
          <div className="frow">
            <label className="field-label">Senha</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
        </div>
        <div style={ROW2}>
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
            <label className="field-label">Categoria</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaUsuario | '')}>
              <option value="">Selecione…</option>
              {CATEGORIAS_USUARIO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Entidade (projeto)</label>
            <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
              <option value="">Sem entidade (matriz)</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome} — {p.cidade}
                </option>
              ))}
            </select>
          </div>
          <div className="frow">
            <label className="field-label">Grupo padrão</label>
            <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
              <option value="">Sem grupo</option>
              {grupos.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nome}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Supervisor</label>
            <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
              <option value="">Sem supervisor</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome}
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
        </div>
        <div className="frow">
          <label className="field-label">Comentários</label>
          <textarea rows={2} value={comentarios} onChange={(e) => setComentarios(e.target.value)} placeholder="Observações (opcional)" />
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
