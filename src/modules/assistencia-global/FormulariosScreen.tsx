import { useState } from 'react'
import SectionSidebarLayout, { type SectionSidebarItem } from '@/components/layout/SectionSidebarLayout'
import FormulariosCatalogo from '@/components/common/FormulariosCatalogo'
import { PROJECT_CATALOGS } from '@/data/catalog'
import { useAllProjects, useProjectTheme } from '@/store/useCatalogStore'

export default function FormulariosScreen() {
  const projects = useAllProjects()
  const [selectedId, setSelectedId] = useState<string | null>(projects[0]?.id ?? null)
  const selected = projects.find((p) => p.id === selectedId) ?? null
  const theme = useProjectTheme(selected?.brandId ?? 'planneta')

  const items: SectionSidebarItem[] = projects.map((p) => ({ key: p.id, label: `${p.nome} — ${p.cidade}`, logo: p.logo }))
  const catalog = selected ? PROJECT_CATALOGS[selected.id] : undefined

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
            <FormulariosCatalogo catalog={catalog} contextLabel={selected.nome} />
          </div>
        ) : (
          <div className="empty-box">Selecione um projeto para ver o catálogo de formulários.</div>
        )}
      </div>
    </SectionSidebarLayout>
  )
}
