import { useState, type ChangeEvent, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { useAllBrandsMap, useCatalogStore } from '@/store/useCatalogStore'
import { resizeImageToDataUrl } from '@/utils/image'
import type { Project } from '@/types'

interface Props {
  /** Presente para editar um projeto existente — ausente para cadastrar um novo. */
  project?: Project
  /** Empresa pré-selecionada ao criar uma nova entidade a partir da tela já filtrada por empresa. */
  defaultBrandId?: string
  onClose: () => void
  onCreated?: () => void
}

export default function AddProjectModal({ project, defaultBrandId, onClose, onCreated }: Props) {
  const addProject = useCatalogStore((s) => s.addProject)
  const updateProject = useCatalogStore((s) => s.updateProject)
  const brandsMap = useAllBrandsMap()
  const brandOptions = Object.values(brandsMap)

  const [nome, setNome] = useState(project?.nome ?? '')
  const [cidade, setCidade] = useState(project?.cidade ?? '')
  const [brandId, setBrandId] = useState(project?.brandId ?? defaultBrandId ?? brandOptions[0]?.id ?? '')
  const [logo, setLogo] = useState<string | null>(project?.logo ?? null)
  const [wallpaper, setWallpaper] = useState<string | null>(project?.wallpaper ?? null)
  const [error, setError] = useState('')

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogo(await resizeImageToDataUrl(file))
  }

  async function handleWallpaperChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setWallpaper(await resizeImageToDataUrl(file, 1000))
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
    if (project) {
      updateProject(project.id, { nome: nome.trim(), cidade: cidade.trim(), brandId, logo, wallpaper })
      onCreated?.()
      onClose()
      return
    }
    addProject({ nome: nome.trim(), cidade: cidade.trim(), brandId, logo })
    onCreated?.()
    onClose()
  }

  return (
    <Modal title={project ? `Editar projeto — ${project.nome}` : 'Novo projeto'} onClose={onClose}>
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
        <div className="frow">
          <label className="field-label">Wallpaper (opcional)</label>
          <input type="file" accept="image/*" onChange={handleWallpaperChange} />
          <div style={{ fontSize: 11.5, color: 'var(--texto-sec)', marginTop: 4 }}>
            Imagem de fundo exibida no painel Início desta unidade.
          </div>
          {wallpaper && (
            <div className="admin-logo-preview" style={{ width: '100%', maxWidth: 280, aspectRatio: '16/9', height: 'auto' }}>
              <img src={wallpaper} alt="Pré-visualização do wallpaper" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          )}
          {wallpaper && (
            <button type="button" className="btn" style={{ fontSize: 11.5, marginTop: 6, padding: '4px 10px' }} onClick={() => setWallpaper(null)}>
              Remover wallpaper
            </button>
          )}
        </div>
        {error && <div className="admin-error">{error}</div>}
        <div className="admin-form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancelar
          </button>
          <button type="button" className="btn btn-primary" onClick={() => handleSubmit()}>
            {project ? 'Salvar alterações' : 'Criar projeto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
