import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'

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
  onHeaderPointerDown?: (e: ReactPointerEvent) => void
}

/**
 * Quadrante de operação (Vtcall/MKTZAP). Enquanto a integração real por
 * token/API não existe, tenta embutir a URL via iframe e sempre oferece um
 * link para abrir em nova aba — muitos provedores bloqueiam ser exibidos em
 * iframe (X-Frame-Options) por segurança própria, então o fallback garante
 * que o atendente sempre consiga acessar o sistema de um jeito ou de outro.
 *
 * Pode ser renderizado "docked" (encaixado na coluna lateral) ou "popped"
 * (janela flutuante arrastável pelo cabeçalho e redimensionável).
 */
export default function OperationPanel({
  title,
  subtitle,
  logo,
  placeholder,
  url,
  externalUrl,
  flexBasisPct,
  popped,
  onTogglePop,
  onHeaderPointerDown,
}: Props) {
  return (
    <div className="op-panel" style={!popped && flexBasisPct != null ? { flexBasis: `${flexBasisPct}%` } : undefined}>
      <div
        className={`op-panel-header${popped ? ' op-panel-header-drag' : ''}`}
        onPointerDown={popped ? onHeaderPointerDown : undefined}
      >
        <img src={logo} alt={title} className="op-panel-logo" />
        <div className="op-panel-titles">
          <div className="op-panel-title">{title}</div>
          <div className="op-panel-subtitle">{subtitle}</div>
        </div>
        {url && <span className="op-panel-live">● ao vivo</span>}
        <button
          className="op-panel-pop"
          onClick={onTogglePop}
          onPointerDown={(e) => e.stopPropagation()}
          title={popped ? 'Fixar novamente na tela principal' : 'Destacar em janela flutuante'}
        >
          {popped ? '📌' : '⤢'}
        </button>
        <a
          className="op-panel-link"
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          onPointerDown={(e) => e.stopPropagation()}
          title="Abrir em nova aba"
        >
          ↗
        </a>
      </div>
      <div className="op-panel-body">{url ? <iframe src={url} title={title} className="op-panel-iframe" /> : placeholder}</div>
    </div>
  )
}
