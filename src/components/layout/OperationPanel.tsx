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
  minimized?: boolean
  onToggleMinimize?: () => void
  popoutBlocked?: boolean
}

/**
 * Quadrante de operação (Vtcall/MKTZAP). Enquanto a integração real por
 * token/API não existe, tenta embutir a URL via iframe e sempre oferece um
 * link para abrir em nova aba — muitos provedores bloqueiam ser exibidos em
 * iframe (X-Frame-Options) por segurança própria, então o fallback garante
 * que o atendente sempre consiga acessar o sistema de um jeito ou de outro.
 *
 * Pode ser renderizado "docked" (encaixado na coluna lateral, podendo ser
 * minimizado), ou "popped" (dentro de uma janela própria do navegador — ver
 * PopoutWindow — que pode ser arrastada para outro monitor).
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
  minimized,
  onToggleMinimize,
  popoutBlocked,
}: Props) {
  return (
    <div
      className={`op-panel${minimized ? ' minimized' : ''}`}
      style={popped ? { height: '100%' } : minimized ? { flex: '0 0 auto' } : flexBasisPct != null ? { flexBasis: `${flexBasisPct}%` } : undefined}
    >
      <div className="op-panel-header">
        <img src={logo} alt={title} className="op-panel-logo" />
        <div className="op-panel-titles">
          <div className="op-panel-title">{title}</div>
          <div className="op-panel-subtitle">{subtitle}</div>
        </div>
        {url && <span className="op-panel-live">● ao vivo</span>}
        {!popped && onToggleMinimize && (
          <button
            className="op-panel-pop"
            onClick={onToggleMinimize}
            title={minimized ? 'Restaurar painel' : 'Ocultar/minimizar painel'}
          >
            {minimized ? '▸' : '▾'}
          </button>
        )}
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
      {!minimized && (
        <>
          {popoutBlocked && !popped && (
            <div className="op-panel-notice">
              Não foi possível abrir uma janela separada — o navegador bloqueou o pop-up. Permita pop-ups para este site e
              clique em "⤢" novamente.
            </div>
          )}
          <div className="op-panel-body">{url ? <iframe src={url} title={title} className="op-panel-iframe" /> : placeholder}</div>
        </>
      )}
    </div>
  )
}
