import { useState, type CSSProperties } from 'react'
import type { ClassificationLabel } from '@/data/catalog'

interface LegendItem {
  color: string
  emoji: string
  label: ClassificationLabel
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
  {
    color: '#7c3aed',
    emoji: '🟣',
    label: 'Habilitação de Mudanças',
    desc: 'Avalia, aprova e coordena mudanças planejadas em sistemas ou infraestrutura, minimizando riscos ao serviço.',
    example: 'Atualização de servidor, alteração de rede, implantação de nova versão de sistema.',
  },
]

interface Props {
  /** Classificação selecionada (modo interativo — vira gatilho de filtro do catálogo abaixo). */
  selected?: ClassificationLabel | null
  /** Presente = itens da legenda viram botões clicáveis; ausente = legenda só de consulta (comportamento original). */
  onSelect?: (label: ClassificationLabel | null) => void
}

/** Legenda de classificação de chamados (Requisição/Incidente/Problema/Habilitação de Mudanças). Quando
 * `onSelect` é passado, cada item vira um gatilho: clicar seleciona a classificação (clicar de novo limpa). */
export default function TicketClassificationLegend({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(true)
  const interactive = !!onSelect

  return (
    <div className="itsm-legend">
      <button type="button" className="itsm-legend-toggle" onClick={() => setOpen((v) => !v)}>
        <span>📖 Legenda — Classificação de Chamados ITSM{interactive ? ' (clique para filtrar)' : ''}</span>
        <span className="ic">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="itsm-legend-grid">
          {ITEMS.map((item) => {
            const isActive = interactive && selected === item.label
            return (
              <button
                type="button"
                aria-pressed={isActive}
                disabled={!interactive}
                className={`itsm-legend-item${interactive ? ' clickable' : ''}${isActive ? ' active' : ''}`}
                key={item.label}
                style={{ '--legend-color': item.color } as CSSProperties}
                onClick={interactive ? () => onSelect!(isActive ? null : item.label) : undefined}
              >
                <div className="itsm-legend-item-head">
                  <span>{item.emoji}</span>
                  <b>{item.label}</b>
                </div>
                <div className="itsm-legend-desc">{item.desc}</div>
                <div className="itsm-legend-example">→ Ex.: {item.example}</div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
