import { useState } from 'react'
import CatalogGrid from './CatalogGrid'
import TicketClassificationLegend from './TicketClassificationLegend'
import type { CatalogItem, ClassificationLabel } from '@/data/catalog'

interface Props {
  catalog: CatalogItem[] | undefined
  /** Nome exibido nas mensagens de estado vazio (projeto ou matriz). */
  contextLabel: string
}

/**
 * Legenda de classificação + catálogo de formulários, funcionando como um fluxo de 2 escolhas:
 * 1) selecionar o tipo de classificação (contexto do chamado, não restringe o catálogo — qualquer
 *    item pode se aplicar a qualquer classificação); 2) selecionar o item do catálogo, que abre as
 *    subcategorias dele (ainda em construção — a granularidade de sub-item virá depois).
 */
export default function FormulariosCatalogo({ catalog, contextLabel }: Props) {
  const [classification, setClassification] = useState<ClassificationLabel | null>(null)
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null)

  function handleSelectClassification(label: ClassificationLabel | null) {
    setClassification(label)
    setSelectedItem(null)
  }

  return (
    <>
      <TicketClassificationLegend selected={classification} onSelect={handleSelectClassification} />

      {!catalog ? (
        <div className="empty-box" style={{ marginTop: 16 }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>📋</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Catálogo ainda não configurado</div>
          <div style={{ fontSize: 12.5, color: 'var(--texto-sec)', lineHeight: 1.6 }}>
            O catálogo de formulários de atendimento para <b>{contextLabel}</b> será cadastrado em breve.
          </div>
          <span className="badge badge-amber" style={{ marginTop: 14 }}>
            Em breve
          </span>
        </div>
      ) : selectedItem ? (
        <div className="subcat-placeholder">
          <div className="subcat-breadcrumb">
            {classification && <>{classification} → </>}
            {selectedItem.icon} {selectedItem.label}
          </div>
          <div style={{ fontSize: 34, marginBottom: 10 }}>🚧</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Subcategorias em construção</div>
          <div style={{ fontSize: 12.5, color: 'var(--texto-sec)', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
            As subcategorias de <b>{selectedItem.label}</b> (o que exatamente aconteceu, o que precisa ser feito)
            ainda serão cadastradas para <b>{contextLabel}</b>.
          </div>
          <button type="button" className="btn subcat-back" onClick={() => setSelectedItem(null)}>
            ← Voltar ao catálogo
          </button>
        </div>
      ) : (
        <>
          {classification && (
            <div className="catalog-filter-bar">
              <span className="badge badge-blue">Classificação selecionada: {classification}</span>
              <button type="button" onClick={() => handleSelectClassification(null)}>
                Trocar ✕
              </button>
            </div>
          )}
          {catalog.length ? (
            <CatalogGrid items={catalog} onSelect={setSelectedItem} />
          ) : (
            <div className="empty-box" style={{ marginTop: 16 }}>
              O catálogo de formulários de atendimento para <b>{contextLabel}</b> será cadastrado em breve.
            </div>
          )}
        </>
      )}
    </>
  )
}
