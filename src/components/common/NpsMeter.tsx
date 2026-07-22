import type { NpsResumo } from '@/utils/chamadoMetrics'

interface Props {
  nps: NpsResumo | null
  title?: string
}

function classificacao(score: number): string {
  if (score >= 75) return 'Excelência'
  if (score >= 50) return 'Qualidade'
  if (score >= 0) return 'Aperfeiçoamento'
  return 'Crítica'
}

/** Medidor de NPS — nota central (-100 a 100) + barra proporcional de detratores/neutros/promotores,
 * a partir das contagens reais já calculadas em calcularNps (sem inventar zonas ou metas). */
export default function NpsMeter({ nps, title }: Props) {
  if (!nps) {
    return (
      <div className="nps-card" title={title}>
        <div className="gauge-title">NPS</div>
        <div className="gauge-sub">Nenhuma avaliação registrada ainda.</div>
      </div>
    )
  }
  const pctDet = (nps.detratores / nps.avaliados) * 100
  const pctNeu = (nps.neutros / nps.avaliados) * 100
  const pctPro = (nps.promotores / nps.avaliados) * 100
  return (
    <div className="nps-card" title={title}>
      <div className="nps-head">
        <div className="nps-score">{nps.nps}</div>
        <div>
          <div className="gauge-title">NPS · {classificacao(nps.nps)}</div>
          <div className="gauge-sub">{nps.avaliados} avaliações</div>
        </div>
      </div>
      <div className="nps-bar">
        {nps.detratores > 0 && <div className="nps-seg det" style={{ width: `${pctDet}%` }} />}
        {nps.neutros > 0 && <div className="nps-seg neu" style={{ width: `${pctNeu}%` }} />}
        {nps.promotores > 0 && <div className="nps-seg pro" style={{ width: `${pctPro}%` }} />}
      </div>
      <div className="nps-legend">
        <span><span className="dot det" />Detratores {nps.detratores}</span>
        <span><span className="dot neu" />Neutros {nps.neutros}</span>
        <span><span className="dot pro" />Promotores {nps.promotores}</span>
      </div>
    </div>
  )
}
