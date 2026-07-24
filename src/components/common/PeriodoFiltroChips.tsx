import { PERIODO_FILTRO_OPCOES, type PeriodoFiltro } from '@/utils/chamadoMetrics'

interface Props {
  value: PeriodoFiltro
  onChange: (valor: PeriodoFiltro) => void
}

/** Filtro de período (Hoje / Últimos 7 dias / Este mês / Todos) para os dashboards em Mosaico
 * (Painel Geral e Início) — reaproveita o estilo de pílula dos chips de status desses painéis. */
export default function PeriodoFiltroChips({ value, onChange }: Props) {
  return (
    <div className="mos-periodo-row">
      {PERIODO_FILTRO_OPCOES.map((o) => (
        <button
          key={o.valor}
          type="button"
          className={`mos-status-item${value === o.valor ? ' on' : ''}`}
          onClick={() => onChange(o.valor)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
