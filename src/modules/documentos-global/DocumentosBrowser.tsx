import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionSidebarLayout, { type SectionSidebarItem } from '@/components/layout/SectionSidebarLayout'
import { PORTFOLIOS } from '@/data/portfolios'
import { TEMPLATES } from '@/data/templates'
import { useAllBrandsMap, useAllProjects } from '@/store/useCatalogStore'
import { brandBadgeStyle } from '@/utils/color'

/** Navegação Empresa → Portfólio → Template, reunindo os documentos de todas as marcas com projetos de campo. */
export default function DocumentosBrowser() {
  const navigate = useNavigate()
  const projects = useAllProjects()
  const brandsMap = useAllBrandsMap()
  const fieldBrandIds = Array.from(new Set(projects.filter((p) => !p.isMatriz).map((p) => p.brandId)))

  const [activeBrandId, setActiveBrandId] = useState(fieldBrandIds[0] ?? 'faz')
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null)

  const brand = brandsMap[activeBrandId]
  const items: SectionSidebarItem[] = fieldBrandIds.map((id) => ({ key: id, label: brandsMap[id]?.nome ?? id, logo: brandsMap[id]?.logo }))
  const activePortfolio = activePortfolioId ? PORTFOLIOS.find((p) => p.id === activePortfolioId) : null
  const templates = activePortfolio ? TEMPLATES.filter((t) => activePortfolio.templateIds.includes(t.id)) : []

  function handleSelectBrand(id: string) {
    setActiveBrandId(id)
    setActivePortfolioId(null)
  }

  return (
    <SectionSidebarLayout title="Empresas" items={items} active={activeBrandId} onSelect={handleSelectBrand}>
      <div className="mod-scroll-area">
        {!activePortfolio ? (
          <>
            <div className="crumb" style={{ marginBottom: 14 }}>
              <span>Central de Documentos</span>
              <span>›</span>
              <b style={{ color: 'var(--texto)' }}>{brand?.nome ?? 'Portfólios'}</b>
            </div>
            <div className="pf-grid">
              {PORTFOLIOS.map((p) => (
                <div className="pf-card" key={p.id} onClick={() => setActivePortfolioId(p.id)}>
                  <div className="pf-icon" style={{ background: p.bg }}>
                    {p.icon}
                  </div>
                  <div className="pf-name">{p.nome}</div>
                  <div className="pf-desc">{p.desc}</div>
                  <div className="pf-foot">
                    <span className="badge badge-blue">{p.templateIds.length} templates</span>
                    <span style={{ fontSize: 12, color: 'var(--azul)', fontWeight: 600 }}>Abrir ›</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="crumb" style={{ marginBottom: 14 }}>
              <a onClick={() => setActivePortfolioId(null)}>{brand?.nome}</a>
              <span>›</span>
              <b style={{ color: 'var(--texto)' }}>{activePortfolio.nome}</b>
            </div>
            <div className="tpl-grid">
              {templates.map((t) => (
                <div className="tpl-card" key={t.id} onClick={() => navigate(`/ferramentas/documentos/${activePortfolio.id}/${t.id}/${activeBrandId}`)}>
                  <div className="tpl-icon" style={{ background: t.iconBg }}>
                    {t.icon}
                  </div>
                  <div className="tpl-name">{t.nome}</div>
                  <div className="tpl-code">{t.code}</div>
                  <div className="tpl-foot">
                    <span className={`badge ${brand?.badgeClass ?? ''}`} style={brand ? brandBadgeStyle(brand) : undefined}>
                      {brand?.nome}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{t.signers.length} assin.</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </SectionSidebarLayout>
  )
}
