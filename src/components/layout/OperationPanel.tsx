import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react'

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
  onDragHandlePointerDown?: (e: ReactPointerEvent) => void
  onHideToEdge?: () => void
}

/**
 * Quadrante de operação (Vtcall/MKTZAP). Enquanto a integração real por
 * token/API não existe, tenta embutir a URL via iframe e sempre oferece um
 * link para abrir em nova aba — muitos provedores bloqueiam ser exibidos em
 * iframe (X-Frame-Options) por segurança própria, então o fallback garante
 * que o atendente sempre consiga acessar o sistema de um jeito ou de outro.
 *
 * Pode ser renderizado "docked" (encaixado na coluna lateral, podendo ser
 * minimizado) ou "popped" (painel flutuante dentro da própria página, que
 * pode ser arrastado pelo cabeçalho e ocultado na lateral direita).
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
  onDragHandlePointerDown,
  onHideToEdge,
}: Props) {
  return (
    <div
      className={`op-panel${minimized ? ' minimized' : ''}`}
      style={popped ? undefined : minimized ? { flex: '0 0 auto' } : flexBasisPct != null ? { flexBasis: `${flexBasisPct}%` } : undefined}
    >
      <div
        className="op-panel-header"
        onPointerDown={
          popped
            ? (e) => {
                e.preventDefault()
                onDragHandlePointerDown?.(e)
              }
            : undefined
        }
        onDragStart={(e) => e.preventDefault()}
        style={popped ? { cursor: 'grab', touchAction: 'none', userSelect: 'none' } : undefined}
      >
        <img src={logo} alt={title} className="op-panel-logo" />
        <div className="op-panel-titles">
          <div className="op-panel-title">{title}</div>
          <div className="op-panel-subtitle">{subtitle}</div>
        </div>
        {url && <span className="op-panel-live">● ao vivo</span>}
        {onToggleMinimize && (
          <button
            className="op-panel-pop"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={onToggleMinimize}
            title={minimized ? 'Restaurar painel' : 'Ocultar/minimizar painel'}
          >
            {minimized ? '▸' : '▾'}
          </button>
        )}
        {popped && onHideToEdge && (
          <button className="op-panel-pop" onPointerDown={(e) => e.stopPropagation()} onClick={onHideToEdge} title="Ocultar na lateral direita">
            »
          </button>
        )}
        <button
          className="op-panel-pop"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onTogglePop}
          title={popped ? 'Fixar novamente na coluna lateral' : 'Destacar como janela flutuante (pode ser arrastada pela tela)'}
        >
          {popped ? '📌' : '⤢'}
        </button>
        <a
          className="op-panel-link"
          href={externalUrl}
          target="_blank"
          rel="noreferrer"
          title="Abrir em nova aba do navegador"
          onPointerDown={(e) => e.stopPropagation()}
        >
          ↗
        </a>
      </div>
      {!minimized && <div className="op-panel-body">{url ? <iframe src={url} title={title} className="op-panel-iframe" /> : placeholder}</div>}
    </div>
  )
}
