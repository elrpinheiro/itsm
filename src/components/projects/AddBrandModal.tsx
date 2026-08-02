import { useState, type ChangeEvent, type FormEvent } from 'react'
import Modal from '@/components/common/Modal'
import { useCatalogStore } from '@/store/useCatalogStore'
import { resizeImageToDataUrl } from '@/utils/image'
import type { Brand } from '@/types'

interface Props {
  /** Presente para editar uma empresa existente — ausente para cadastrar uma nova. */
  brand?: Brand
  onClose: () => void
  onCreated?: (brandId: string) => void
}

export default function AddBrandModal({ brand, onClose, onCreated }: Props) {
  const addBrand = useCatalogStore((s) => s.addBrand)
  const updateBrand = useCatalogStore((s) => s.updateBrand)
  const [nome, setNome] = useState(brand?.nome ?? '')
  const [razaoSocial, setRazaoSocial] = useState(brand?.razaoSocial ?? '')
  const [cor, setCor] = useState(brand?.cor ?? '#0D2B5E')
  const [logo, setLogo] = useState<string | null>(brand?.logo ?? null)
  const [error, setError] = useState('')

  async function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLogo(await resizeImageToDataUrl(file))
  }

  function handleSubmit(e?: FormEvent) {
    e?.preventDefault()
    if (!nome.trim()) {
      setError('Informe o nome da empresa.')
      return
    }
    if (!logo) {
      setError('Envie o logotipo da empresa.')
      return
    }
    if (brand) {
      updateBrand(brand.id, { nome: nome.trim(), razaoSocial: razaoSocial.trim(), cor, logo })
      onCreated?.(brand.id)
      onClose()
      return
    }
    const id = addBrand({ nome: nome.trim(), razaoSocial: razaoSocial.trim(), cor, logo })
    onCreated?.(id)
    onClose()
  }

  return (
    <Modal title={brand ? `Editar empresa — ${brand.nome}` : 'Nova empresa mantenedora'} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="frow">
          <label className="field-label">Nome da empresa</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Instituto Vitae" />
        </div>
        <div className="frow">
          <label className="field-label">Razão social (opcional)</label>
          <input
            type="text"
            value={razaoSocial}
            onChange={(e) => setRazaoSocial(e.target.value)}
            placeholder="Ex.: Instituto Vitae de Educação Ltda."
          />
        </div>
        <div className="frow">
          <label className="field-label">Cor principal</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="color"
              value={cor}
              onChange={(e) => setCor(e.target.value)}
              className="admin-color-input"
              title="Cor principal da marca"
            />
            <span style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>
              Usada para tematizar o sistema quando um projeto dessa empresa for selecionado.
            </span>
          </div>
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
            {brand ? 'Salvar alterações' : 'Criar empresa'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
