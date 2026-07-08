import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  logo: string
  placeholder: ReactNode
  url: string | null
  externalUrl: string
  flexBasisPct: number
}

/**
 * Quadrante fixo de operação (Vtcall/MKTZAP). Enquanto a integração real por
 * token/API não existe, tenta embutir a URL via iframe e sempre oferece um
 * link para abrir em nova aba — muitos provedores bloqueiam ser exibidos em
 * iframe (X-Frame-Options) por segurança própria, então o fallback garante
 * que o atendente sempre consiga acessar o sistema de um jeito ou de outro.
 */
export default function OperationPanel({ title, subtitle, logo, placeholder, url, externalUrl, flexBasisPct }: Props) {
  return (
    <div className="op-panel" style={{ flexBasis: `${flexBasisPct}%` }}>
      <div className="op-panel-header">
        <img src={logo} alt={title} className="op-panel-logo" />
        <div className="op-panel-titles">
          <div className="op-panel-title">{title}</div>
          <div className="op-panel-subtitle">{subtitle}</div>
        </div>
        {url && <span className="op-panel-live">● ao vivo</span>}
        <a
          className="op-panel-link"
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          title="Abrir em nova aba"
        >
          ↗
        </a>
      </div>
      <div className="op-panel-body">{url ? <iframe src={url} title={title} className="op-panel-iframe" /> : placeholder}</div>
    </div>
  )
}
