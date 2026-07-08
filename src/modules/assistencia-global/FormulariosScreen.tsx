import { useState } from 'react'
import SectionSidebarLayout, { type SectionSidebarItem } from '@/components/layout/SectionSidebarLayout'
import { useAllProjects, useProjectTheme } from '@/store/useCatalogStore'

export default function FormulariosScreen() {
  const projects = useAllProjects()
  const [selectedId, setSelectedId] = useState<string | null>(projects[0]?.id ?? null)
  const selected = projects.find((p) => p.id === selectedId) ?? null
  const theme = useProjectTheme(selected?.brandId ?? 'planneta')

  const items: SectionSidebarItem[] = projects.map((p) => ({ key: p.id, label: `${p.nome} — ${p.cidade}`, logo: p.logo }))

  return (
    <SectionSidebarLayout title="Projetos" items={items} active={selectedId ?? ''} onSelect={setSelectedId}>
      <div className="mod-scroll-area">
        {selected ? (
          <div className="mod-catalog">
            <div className="mod-catalog-head">
              <img src={selected.logo} alt={selected.nome} className="mod-catalog-logo" />
              <div>
                <div className="mod-catalog-title">{selected.nome}</div>
                <div className="mod-catalog-sub" style={{ color: theme.texto }}>
                  {selected.cidade}
                </div>
              </div>
            </div>
            <div className="empty-box" style={{ marginTop: 20 }}>
              <div style={{ fontSize: 34, marginBottom: 10 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Catálogo ainda não configurado</div>
              <div style={{ fontSize: 12.5, color: 'var(--texto-sec)', lineHeight: 1.6 }}>
                O catálogo de formulários de atendimento para <b>{selected.nome}</b> será cadastrado em breve — cada
                projeto/matriz terá o seu próprio, de acordo com os serviços que oferece.
              </div>
              <span className="badge badge-amber" style={{ marginTop: 14 }}>
                Em breve
              </span>
            </div>
          </div>
        ) : (
          <div className="empty-box">Selecione um projeto para ver o catálogo de formulários.</div>
        )}
      </div>
    </SectionSidebarLayout>
  )
}
