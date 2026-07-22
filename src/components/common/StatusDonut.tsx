import type { CSSProperties } from 'react'

interface Segment {
  key: string
  total: number
  cor: string
}

interface Props {
  data: Segment[]
}

/** Donut multi-segmento em conic-gradient — o Pie do recharts 3.9.2 corta setores com mais de 180°
 * (bug da lib: o large-arc-flag do path sai sempre 0), então o anel de status é desenhado à mão. */
export default function StatusDonut({ data }: Props) {
  const total = data.reduce((s, d) => s + d.total, 0)
  let acc = 0
  const stops = data.map((d) => {
    const start = (acc / total) * 100
    acc += d.total
    const end = (acc / total) * 100
    return `${d.cor} ${start}% ${end}%`
  })
  const style: CSSProperties = { background: total > 0 ? `conic-gradient(${stops.join(', ')})` : 'var(--borda)' }
  return (
    <div className="status-donut" style={style}>
      <div className="status-donut-hole">
        <div className="status-donut-total">{total}</div>
        <div className="status-donut-lbl">chamados</div>
      </div>
    </div>
  )
}
