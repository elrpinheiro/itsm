import type { CSSProperties } from 'react'

interface Props {
  percentual: number | null
  foraDoPrazo: number
  total: number
  title?: string
}

function corPorFaixa(pct: number): string {
  if (pct >= 90) return 'var(--verde)'
  if (pct >= 70) return 'var(--amarelo)'
  return 'var(--vermelho-texto)'
}

/** Gauge circular de SLA (conic-gradient) — verde/amarelo/vermelho pela mesma faixa usada em
 * badges de prioridade, sem depender de biblioteca de gráficos para um anel simples. */
export default function SlaGauge({ percentual, foraDoPrazo, total, title }: Props) {
  const pct = percentual ?? 0
  const style: CSSProperties & Record<string, string | number> = {
    '--gauge-pct': pct,
    '--gauge-cor': corPorFaixa(pct),
  }
  return (
    <div className="gauge-card" title={title}>
      <div className="gauge-ring" style={style}>
        <div className="gauge-ring-hole">
          <div className="gauge-pct">{percentual === null ? '—' : `${percentual}%`}</div>
        </div>
      </div>
      <div>
        <div className="gauge-title">SLA cumprido</div>
        <div className="gauge-sub">
          {total === 0 ? 'Nenhum chamado registrado ainda.' : `${total - foraDoPrazo} de ${total} chamados dentro do prazo`}
        </div>
      </div>
    </div>
  )
}
