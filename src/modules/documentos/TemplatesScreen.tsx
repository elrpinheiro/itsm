import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { PORTFOLIOS } from '@/data/portfolios'
import { TEMPLATES } from '@/data/templates'
import { BRANDS, BRAND_LIST } from '@/data/brands'
import type { BrandId } from '@/types'

type FilterValue = 'todos' | BrandId

export default function TemplatesScreen() {
  const { portfolioId } = useParams()
  const navigate = useNavigate()
  const portfolio = PORTFOLIOS.find((p) => p.id === portfolioId)
  const [filter, setFilter] = useState<FilterValue>('todos')
  const [query, setQuery] = useState('')

  const templates = portfolio ? TEMPLATES.filter((t) => portfolio.templateIds.includes(t.id)) : TEMPLATES

  const cards = useMemo(() => {
    const q = query.trim().toLowerCase()
    const result: { templateId: string; brandId: BrandId }[] = []
    templates.forEach((t) => {
      BRAND_LIST.forEach((b) => {
        if (filter !== 'todos' && filter !== b.id) return
        if (q && !t.nome.toLowerCase().includes(q) && !t.code.toLowerCase().includes(q)) return
        result.push({ templateId: t.id, brandId: b.id })
      })
    })
    return result
  }, [templates, filter, query])

  if (!portfolio) {
    return (
      <div className="empty-box">
        <div style={{ fontSize: 16, fontWeight: 700 }}>Portfólio não encontrado</div>
        <button className="btn" style={{ marginTop: 12 }} onClick={() => navigate('/app/documentos')}>
          ← Voltar aos portfólios
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="crumb" style={{ marginBottom: 14 }}>
        <a onClick={() => navigate('/app/documentos')}>Central de Documentos</a>
        <span>›</span>
        <a onClick={() => navigate('/app/documentos')}>Portfólios</a>
        <span>›</span>
        <b style={{ color: 'var(--texto)' }}>{portfolio.nome}</b>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <span className={`chip${filter === 'todos' ? ' on' : ''}`} onClick={() => setFilter('todos')}>
          Todos
        </span>
        {BRAND_LIST.map((b) => (
          <span key={b.id} className={`chip${filter === b.id ? ' on' : ''}`} onClick={() => setFilter(b.id)}>
            {b.nome}
          </span>
        ))}
        <input
          type="text"
          placeholder="Buscar documento..."
          style={{ maxWidth: 220, marginLeft: 'auto' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div className="tpl-grid">
        {cards.map(({ templateId, brandId }) => {
          const t = templates.find((x) => x.id === templateId)!
          const b = BRANDS[brandId]
          return (
            <div
              className="tpl-card"
              key={`${templateId}-${brandId}`}
              onClick={() => navigate(`${templateId}/${brandId}`)}
            >
              <div className="tpl-icon" style={{ background: t.iconBg }}>
                {t.icon}
              </div>
              <div className="tpl-name">{t.nome}</div>
              <div className="tpl-code">{t.code}</div>
              <div className="tpl-foot">
                <span className={`badge ${b.badgeClass}`}>{b.nome}</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.signers.length} assin.</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
