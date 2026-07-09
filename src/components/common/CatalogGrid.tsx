import type { CatalogItem } from '@/data/catalog'

interface Props {
  items: CatalogItem[]
  onSelect?: (item: CatalogItem) => void
}

/** Grade de itens do catálogo de atendimento (ícone + rótulo) de um projeto. */
export default function CatalogGrid({ items, onSelect }: Props) {
  return (
    <div className="catalog-grid">
      {items.map((item, i) => (
        <button key={i} type="button" className="catalog-item" onClick={() => onSelect?.(item)}>
          <span className="catalog-item-icon">{item.icon}</span>
          <span className="catalog-item-label">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
