import { useState, type CSSProperties, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { CATEGORIAS_USUARIO, type CategoriaUsuario, type OrigemUsuario, type Usuario } from '@/data/administracaoMock'
import { useAdminStore } from '@/store/useAdminStore'
import { useAllProjects } from '@/store/useCatalogStore'

interface Props {
  onClose: () => void
  /** Presente = edita este usuário; ausente = cria um novo. */
  usuario?: Usuario
  /** Entidade (projeto) pré-selecionada quando o cadastro é aberto de dentro de um projeto específico. */
  defaultProjetoId?: string
}

const ROW2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }

/** Formulário de usuário — serve tanto para criar quanto para editar (basta passar `usuario`).
 * Cobre todos os campos, incluindo troca de senha e mudança de entidade/perfil/grupos, num só lugar. */
export default function UsuarioFormModal({ onClose, usuario, defaultProjetoId }: Props) {
  const perfis = useAdminStore((s) => s.perfis)
  const grupos = useAdminStore((s) => s.grupos)
  const usuarios = useAdminStore((s) => s.usuarios)
  const addUsuario = useAdminStore((s) => s.addUsuario)
  const updateUsuario = useAdminStore((s) => s.updateUsuario)
  const projetos = useAllProjects()
  const projetoMap = Object.fromEntries(projetos.map((p) => [p.id, `${p.nome} — ${p.cidade}`]))

  const isEdit = !!usuario

  const [primeiroNome, setPrimeiroNome] = useState(usuario?.primeiroNome ?? '')
  const [sobrenome, setSobrenome] = useState(usuario?.sobrenome ?? '')
  const [email, setEmail] = useState(usuario?.email ?? '')
  const [telefone, setTelefone] = useState(usuario?.telefone ?? '')
  const [celular, setCelular] = useState(usuario?.celular ?? '')
  const [cargo, setCargo] = useState(usuario?.cargo ?? '')
  const [login, setLogin] = useState(usuario?.login ?? '')
  const [senha, setSenha] = useState('')
  const [perfilId, setPerfilId] = useState(usuario?.perfilId ?? perfis[0]?.id ?? '')
  const [origem, setOrigem] = useState<OrigemUsuario>(usuario?.origem ?? 'Local')
  const [categoria, setCategoria] = useState<CategoriaUsuario | ''>(usuario?.categoria ?? '')
  const [projetoId, setProjetoId] = useState(usuario?.projetoId ?? defaultProjetoId ?? '')
  const [grupoIds, setGrupoIds] = useState<string[]>(usuario?.grupoIds ?? [])
  const [supervisorId, setSupervisorId] = useState(usuario?.supervisorId ?? '')
  const [comentarios, setComentarios] = useState(usuario?.comentarios ?? '')
  const [error, setError] = useState('')

  function toggleGrupo(id: string) {
    setGrupoIds((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]))
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!primeiroNome.trim()) return setError('Informe o primeiro nome.')
    if (!sobrenome.trim()) return setError('Informe o sobrenome.')
    if (!email.trim()) return setError('Informe o e-mail do usuário.')
    if (!login.trim()) return setError('Informe o login do usuário.')
    if (!isEdit && !senha.trim()) return setError('Informe a senha do usuário.')

    const dadosComuns = {
      primeiroNome,
      sobrenome,
      email,
      telefone: telefone || undefined,
      celular: celular || undefined,
      cargo: cargo || undefined,
      login,
      perfilId,
      origem,
      categoria: categoria || undefined,
      projetoId: projetoId || undefined,
      grupoIds,
      supervisorId: supervisorId || undefined,
      comentarios: comentarios || undefined,
    }

    if (isEdit && usuario) {
      updateUsuario(usuario.id, { ...dadosComuns, novaSenha: senha || undefined })
    } else {
      addUsuario({ ...dadosComuns, senha })
    }
    onClose()
  }

  return (
    <Modal title={isEdit ? `Editar usuário — ${usuario!.nome}` : 'Novo usuário'} onClose={onClose}>
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
            <label className="field-label">{isEdit ? 'Nova senha' : 'Senha'}</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder={isEdit ? 'Deixe em branco para manter' : '••••••••'}
            />
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
            <label className="field-label">Supervisor</label>
            <select value={supervisorId} onChange={(e) => setSupervisorId(e.target.value)}>
              <option value="">Sem supervisor</option>
              {usuarios
                .filter((u) => u.id !== usuario?.id)
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className="frow">
          <label className="field-label">Grupos</label>
          <div style={{ border: '1px solid var(--borda)', borderRadius: 8, padding: '8px 12px', maxHeight: 130, overflowY: 'auto' }}>
            {grupos.length === 0 && <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Nenhum grupo cadastrado.</div>}
            {grupos.map((g) => (
              <label key={g.id} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, fontSize: 12.5 }}>
                <input type="checkbox" checked={grupoIds.includes(g.id)} onChange={() => toggleGrupo(g.id)} style={{ width: 'auto' }} />
                {g.nome}
                {g.projetoId ? ` — ${projetoMap[g.projetoId] ?? ''}` : ' (global)'}
              </label>
            ))}
          </div>
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
        <div className="frow">
          <label className="field-label">Comentários</label>
          <textarea rows={2} value={comentarios} onChange={(e) => setComentarios(e.target.value)} placeholder="Observações (opcional)" />
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
            {isEdit ? 'Salvar alterações' : 'Criar usuário'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
