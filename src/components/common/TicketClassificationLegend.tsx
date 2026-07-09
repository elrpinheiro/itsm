import { useState, type CSSProperties } from 'react'

interface LegendItem {
  color: string
  emoji: string
  label: string
  desc: string
  example: string
}

const ITEMS: LegendItem[] = [
  {
    color: '#2563eb',
    emoji: '🔵',
    label: 'Requisição',
    desc: 'Solicitação padrão e planejada do usuário.',
    example: 'Instalar software, criar acesso, resetar senha.',
  },
  {
    color: '#dc2626',
    emoji: '🔴',
    label: 'Incidente',
    desc: 'Interrupção ou falha inesperada que precisa ser restaurada com urgência.',
    example: 'Reiniciar serviço, restaurar conexão de rede.',
  },
  {
    color: '#f59e0b',
    emoji: '🟠',
    label: 'Problema',
    desc: 'Causa raiz de incidentes recorrentes, investigada para solução definitiva.',
    example: 'Corrigir bug recorrente no servidor.',
  },
]

/** Legenda de classificação de chamados (Requisição/Incidente/Problema), para orientar a equipe ao abrir/triar demandas. */
export default function TicketClassificationLegend() {
  const [open, setOpen] = useState(true)

  return (
    <div className="itsm-legend">
      <button type="button" className="itsm-legend-toggle" onClick={() => setOpen((v) => !v)}>
        <span>📖 Legenda — Classificação de Chamados ITSM</span>
        <span className="ic">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="itsm-legend-grid">
          {ITEMS.map((item) => (
            <div className="itsm-legend-item" key={item.label} style={{ '--legend-color': item.color } as CSSProperties}>
              <div className="itsm-legend-item-head">
                <span>{item.emoji}</span>
                <b>{item.label}</b>
              </div>
              <div className="itsm-legend-desc">{item.desc}</div>
              <div className="itsm-legend-example">→ Ex.: {item.example}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
