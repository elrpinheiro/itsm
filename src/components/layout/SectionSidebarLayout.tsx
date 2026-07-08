import type { ReactNode } from 'react'

export interface SectionSidebarItem {
  key: string
  label: string
  icon?: string
  logo?: string
}

interface Props {
  title?: string
  items: SectionSidebarItem[]
  active: string
  onSelect: (key: string) => void
  children: ReactNode
}

/** Layout genérico "lista lateral + conteúdo", usado por Administração, Ativos e o seletor de projetos dos Formulários. */
export default function SectionSidebarLayout({ title, items, active, onSelect, children }: Props) {
  return (
    <div className="sec-layout">
      <div className="sec-sidebar">
        {title && <div className="sec-sidebar-title">{title}</div>}
        <div className="sec-sidebar-list">
          {items.map((item) => (
            <button
              key={item.key}
              className={`sec-sidebar-item${active === item.key ? ' on' : ''}`}
              onClick={() => onSelect(item.key)}
              title={item.label}
            >
              {item.logo ? (
                <img src={item.logo} alt="" className="sec-sidebar-item-logo" />
              ) : (
                item.icon && <span className="ic">{item.icon}</span>
              )}
              <span className="sec-sidebar-item-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="sec-content">{children}</div>
    </div>
  )
}
