import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PORTFOLIOS } from '@/data/portfolios'
import { TEMPLATES } from '@/data/templates'
import { useBrand } from '@/store/useCatalogStore'
import { useProjectStore } from '@/store/useProjectStore'
import { brandBadgeStyle } from '@/utils/color'

export default function TemplatesScreen() {
  const { portfolioId } = useParams()
  const navigate = useNavigate()
  const project = useProjectStore((s) => s.selectedProject)
  const brand = useBrand(project?.brandId ?? 'planneta')
  const portfolio = PORTFOLIOS.find((p) => p.id === portfolioId)
  const [query, setQuery] = useState('')

  const templates = portfolio ? TEMPLATES.filter((t) => portfolio.templateIds.includes(t.id)) : TEMPLATES

  const cards = useMemo(() => {
    const q = query.trim().toLowerCase()
    return templates.filter((t) => !q || t.nome.toLowerCase().includes(q) || t.code.toLowerCase().includes(q))
  }, [templates, query])

  if (!portfolio) {
    return (
      <div className="empty-box">
        <div style={{ fontSize: 16, fontWeight: 700 }}>Portfólio não encontrado</div>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => navigate('/app/ferramentas/documentos')}>
          ← Voltar aos portfólios
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="crumb" style={{ marginBottom: 14 }}>
        <a onClick={() => navigate('/app/ferramentas/documentos')}>Central de Documentos</a>
        <span>›</span>
        <a onClick={() => navigate('/app/ferramentas/documentos')}>Portfólios</a>
        <span>›</span>
        <b style={{ color: 'var(--texto)' }}>{portfolio.nome}</b>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 14,
          flexWrap: 'wrap',
          padding: '8px 12px',
          background: '#fff',
          border: '1px solid var(--borda)',
          borderRadius: 10,
        }}
      >
        <img src={brand.logo} alt={brand.nome} style={{ height: 20, maxWidth: 70, objectFit: 'contain' }} />
        <span style={{ fontSize: 12, color: 'var(--texto-sec)' }}>
          Documentos com a identidade visual de <b style={{ color: 'var(--texto)' }}>{brand.nome}</b>
        </span>
        <input
          type="text"
          placeholder="Buscar documento..."
          style={{ maxWidth: 220, marginLeft: 'auto' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="tpl-grid">
        {cards.map((t) => (
          <div className="tpl-card" key={t.id} onClick={() => navigate(`${t.id}/${brand.id}`)}>
            <div className="tpl-icon" style={{ background: t.iconBg }}>
              {t.icon}
            </div>
            <div className="tpl-name">{t.nome}</div>
            <div className="tpl-code">{t.code}</div>
            <div className="tpl-foot">
              <span className={`badge ${brand.badgeClass ?? ''}`} style={brandBadgeStyle(brand)}>
                {brand.nome}
              </span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.signers.length} assin.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
