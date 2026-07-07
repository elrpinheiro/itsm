import { useNavigate } from 'react-router-dom'
import { PORTFOLIOS } from '@/data/portfolios'
import { BRAND_LIST } from '@/data/brands'

export default function PortfoliosScreen() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="crumb" style={{ marginBottom: 14 }}>
        <span>Central de Documentos</span>
        <span>›</span>
        <b style={{ color: 'var(--texto)' }}>Portfólios</b>
      </div>
      <div className="pf-grid">
        {PORTFOLIOS.map((p) => {
          const nDocs = p.templateIds.length * BRAND_LIST.length
          return (
            <div className="pf-card" key={p.id} onClick={() => navigate(p.id)}>
              <div className="pf-icon" style={{ background: p.bg }}>
                {p.icon}
              </div>
              <div className="pf-name">{p.nome}</div>
              <div className="pf-desc">{p.desc}</div>
              <div className="pf-foot">
                <span className="badge badge-blue">{nDocs} templates</span>
                <span style={{ fontSize: 12, color: 'var(--azul)', fontWeight: 600 }}>Abrir ›</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
