import { useState, type CSSProperties } from 'react'
import { VISIBILIDADE_LEGEND } from './mudancaVisibilidade'

const COLORS: Record<string, string> = {
  'Mudança Padrão (Standard Change)': '#16a34a',
  'Mudança Normal (Normal Change)': '#2563eb',
  'Mudança Emergencial (Emergency Change)': '#dc2626',
}

/**
 * Nota de referência (não faz parte do documento) explicando os tipos de visibilidade de uma
 * Habilitação de Mudanças, para o preenchedor saber qual classificação marcar no formulário.
 */
export default function VisibilidadeLegend() {
  const [open, setOpen] = useState(true)

  return (
    <div className="itsm-legend" style={{ marginTop: 18, marginBottom: 0 }}>
      <button type="button" className="itsm-legend-toggle" onClick={() => setOpen((v) => !v)}>
        <span>⚠️ Aviso — Tipos de Visibilidade de uma Habilitação de Mudanças (consulta)</span>
        <span className="ic">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="itsm-legend-grid">
          {VISIBILIDADE_LEGEND.map((item) => (
            <div
              className="itsm-legend-item"
              key={item.label}
              style={{ '--legend-color': COLORS[item.label] ?? 'var(--tema)' } as CSSProperties}
            >
              <div className="itsm-legend-item-head">
                <b>{item.label}</b>
              </div>
              <div className="itsm-legend-desc">
                <b>Características:</b> {item.caracteristicas}
              </div>
              <div className="itsm-legend-desc">
                <b>Aprovação:</b> {item.aprovacao}
              </div>
              <div className="itsm-legend-example">→ Ex.: {item.exemplo}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
