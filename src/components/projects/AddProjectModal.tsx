import { useState, type ChangeEvent, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { useAllBrandsMap, useCatalogStore } from '@/store/useCatalogStore'
import { resizeImageToDataUrl } from '@/utils/image'

interface Props {
  onClose: () => void
  onCreated?: () => void
}

export default function AddProjectModal({ onClose, onCreated }: Props) {
  const addProject = useCatalogStore((s) => s.addProject)
  const brandsMap = useAllBrandsMap()
  const brandOptions = Object.values(brandsMap)

  const [nome, setNome] = useState('')
  const [cidade, setCidade] = useState('')
  const [brandId, setBrandId] = useState(brandOptions[0]?.id ?? '')
  const [logo, setLogo] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogo(await resizeImageToDataUrl(file))
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!cidade.trim() || !nome.trim()) {
      setError('Preencha a cidade e o nome do projeto.')
      return
    }
    if (!brandId) {
      setError('Selecione a empresa mantenedora.')
      return
    }
    if (!logo) {
      setError('Envie o logotipo do projeto.')
      return
    }
    addProject({ nome: nome.trim(), cidade: cidade.trim(), brandId, logo })
    onCreated?.()
    onClose()
  }

  return (
    <Modal title="Novo projeto" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="frow">
          <label className="field-label">Cidade</label>
          <input type="text" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex.: Sorocaba" />
        </div>
        <div className="frow">
          <label className="field-label">Nome do projeto</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Escola Conectada" />
        </div>
        <div className="frow">
          <label className="field-label">Empresa mantenedora</label>
          {brandOptions.length > 0 ? (
            <select value={brandId} onChange={(e) => setBrandId(e.target.value)}>
              {brandOptions.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Cadastre uma empresa primeiro.</div>
          )}
        </div>
        <div className="frow">
          <label className="field-label">Logotipo</label>
          <input type="file" accept="image/*" onChange={handleLogoChange} />
          {logo && (
            <div className="admin-logo-preview">
              <img src={logo} alt="Pré-visualização do logotipo" />
            </div>
          )}
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
            Criar projeto
          </button>
        </div>
      </form>
    </Modal>
  )
}
