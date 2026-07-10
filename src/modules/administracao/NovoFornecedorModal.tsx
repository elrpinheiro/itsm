import { useState, type CSSProperties, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { TIPOS_FORNECEDOR, type TipoFornecedor } from '@/data/administracaoMock'
import { useAdminStore } from '@/store/useAdminStore'
import { useAllProjects } from '@/store/useCatalogStore'

interface Props {
  onClose: () => void
  /** Entidade (projeto) pré-selecionada quando o cadastro é aberto de dentro de um projeto específico. */
  defaultProjetoId?: string
}

const ROW2: CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }

export default function NovoFornecedorModal({ onClose, defaultProjetoId }: Props) {
  const addFornecedor = useAdminStore((s) => s.addFornecedor)
  const projetos = useAllProjects()

  const [empresa, setEmpresa] = useState('')
  const [tipo, setTipo] = useState<TipoFornecedor>(TIPOS_FORNECEDOR[0])
  const [servico, setServico] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [site, setSite] = useState('')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [comentarios, setComentarios] = useState('')
  const [projetoId, setProjetoId] = useState(defaultProjetoId ?? '')
  const [error, setError] = useState('')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!empresa.trim()) return setError('Informe o nome da empresa.')
    if (!servico.trim()) return setError('Informe o serviço/produto fornecido.')
    if (!email.trim()) return setError('Informe o e-mail de contato.')
    if (!telefone.trim()) return setError('Informe o telefone de contato.')
    addFornecedor({
      empresa,
      tipo,
      servico,
      email,
      telefone,
      site: site || undefined,
      endereco: endereco || undefined,
      cidade: cidade || undefined,
      estado: estado || undefined,
      comentarios: comentarios || undefined,
      projetoId: projetoId || undefined,
    })
    onClose()
  }

  return (
    <Modal title="Novo fornecedor" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Empresa</label>
            <input type="text" value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Ex.: NetLink Provedor" />
          </div>
          <div className="frow">
            <label className="field-label">Tipo de terceiro</label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoFornecedor)}>
              {TIPOS_FORNECEDOR.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="frow">
          <label className="field-label">Serviço/produto fornecido</label>
          <input type="text" value={servico} onChange={(e) => setServico(e.target.value)} placeholder="Ex.: Link de internet dedicado" />
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">E-mail de contato</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@fornecedor.com.br" />
          </div>
          <div className="frow">
            <label className="field-label">Telefone</label>
            <input type="text" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(11) 4000-0000" />
          </div>
        </div>
        <div className="frow">
          <label className="field-label">Site (opcional)</label>
          <input type="text" value={site} onChange={(e) => setSite(e.target.value)} placeholder="https://fornecedor.com.br" />
        </div>
        <div style={ROW2}>
          <div className="frow">
            <label className="field-label">Cidade</label>
            <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: São Paulo" />
          </div>
          <div className="frow">
            <label className="field-label">Estado (UF)</label>
            <input type="text" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Ex.: SP" maxLength={2} />
          </div>
        </div>
        <div className="frow">
          <label className="field-label">Endereço (opcional)</label>
          <input type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro" />
        </div>
        <div className="frow">
          <label className="field-label">Entidade (projeto)</label>
          <select value={projetoId} onChange={(e) => setProjetoId(e.target.value)}>
            <option value="">Sem entidade (fornecedor global — disponível para todos os projetos)</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.cidade}
              </option>
            ))}
          </select>
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
            Criar fornecedor
          </button>
        </div>
      </form>
    </Modal>
  )
}
