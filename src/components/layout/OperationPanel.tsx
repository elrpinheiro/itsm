import type { ReactNode } from 'react'

interface Props {
  title: string
  subtitle: string
  logo: string
  placeholder: ReactNode
  url: string | null
  externalUrl: string
  flexBasisPct?: number
  popped: boolean
  onTogglePop: () => void
}

/**
 * Quadrante de operação (Vtcall/MKTZAP). Enquanto a integração real por
 * token/API não existe, tenta embutir a URL via iframe e sempre oferece um
 * link para abrir em nova aba — muitos provedores bloqueiam ser exibidos em
 * iframe (X-Frame-Options) por segurança própria, então o fallback garante
 * que o atendente sempre consiga acessar o sistema de um jeito ou de outro.
 *
 * Pode ser renderizado "docked" (encaixado na coluna lateral) ou "popped"
 * (dentro de uma janela própria do navegador — ver PopoutWindow — que pode
 * ser arrastada para outro monitor).
 */
export default function OperationPanel({ title, subtitle, logo, placeholder, url, externalUrl, flexBasisPct, popped, onTogglePop }: Props) {
  return (
    <div
      className="op-panel"
      style={popped ? { height: '100%' } : flexBasisPct != null ? { flexBasis: `${flexBasisPct}%` } : undefined}
    >
      <div className="op-panel-header">
        <img src={logo} alt={title} className="op-panel-logo" />
        <div className="op-panel-titles">
          <div className="op-panel-title">{title}</div>
          <div className="op-panel-subtitle">{subtitle}</div>
        </div>
        {url && <span className="op-panel-live">● ao vivo</span>}
        <button
          className="op-panel-pop"
          onClick={onTogglePop}
          title={popped ? 'Fixar novamente na tela principal' : 'Destacar em janela própria (dá para mover para outro monitor)'}
        >
          {popped ? '📌' : '⤢'}
        </button>
        <a className="op-panel-link" href={externalUrl} target="_blank" rel="noreferrer" title="Abrir em nova aba">
          ↗
        </a>
      </div>
      <div className="op-panel-body">{url ? <iframe src={url} title={title} className="op-panel-iframe" /> : placeholder}</div>
    </div>
  )
}
