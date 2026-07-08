import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  title: string
  onClose: () => void
  /** Chamado quando o navegador recusa abrir a janela (pop-up bloqueado) — além de onClose, que sempre roda para reverter o estado "popped". */
  onOpenFailed?: () => void
  children: ReactNode
  width?: number
  height?: number
}

/**
 * Abre uma janela real do navegador (não uma div flutuante na mesma página) e
 * renderiza `children` nela via portal, mantendo o mesmo estado/React tree da
 * janela principal. Isso permite arrastar a janela para outro monitor —
 * diferente de um painel flutuante, que fica preso à aba/janela original.
 *
 * Se o navegador bloquear o pop-up (comum dentro de iframes de preview, por
 * exemplo), `window.open` retorna null — nesse caso avisamos via `onOpenFailed`
 * em vez de um `window.alert`, que pode não aparecer em contextos restritos.
 */
export default function PopoutWindow({ title, onClose, onOpenFailed, children, width = 420, height = 640 }: Props) {
  const [container, setContainer] = useState<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const onOpenFailedRef = useRef(onOpenFailed)
  onOpenFailedRef.current = onOpenFailed

  useEffect(() => {
    const win = window.open('', '', `width=${width},height=${height}`)
    if (!win) {
      onOpenFailedRef.current?.()
      onCloseRef.current()
      return
    }

    win.document.title = title
    win.document.head.innerHTML = ''
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach((node) => {
      win.document.head.appendChild(node.cloneNode(true))
    })
    win.document.documentElement.style.height = '100%'
    win.document.body.style.height = '100%'
    win.document.body.style.margin = '0'

    const div = win.document.createElement('div')
    div.style.height = '100%'
    win.document.body.appendChild(div)
    setContainer(div)

    const handleUnload = () => onCloseRef.current()
    win.addEventListener('beforeunload', handleUnload)
    const watchdog = window.setInterval(() => {
      if (win.closed) {
        window.clearInterval(watchdog)
        onCloseRef.current()
      }
    }, 500)

    return () => {
      window.clearInterval(watchdog)
      win.removeEventListener('beforeunload', handleUnload)
      win.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!container) return null
  return createPortal(children, container)
}
