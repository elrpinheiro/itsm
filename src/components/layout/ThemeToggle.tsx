import { useEffect, useRef, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/store/useThemeStore'

const OPTIONS: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: 'light', label: 'Claro', Icon: Sun },
  { mode: 'dark', label: 'Escuro', Icon: Moon },
]

interface Props {
  /** 'header' — botão translúcido para a barra escura do topo (padrão).
   *  'plain' — botão neutro para fundos claros/escuros comuns, ex.: tela de login. */
  variant?: 'header' | 'plain'
}

/** Botão do cabeçalho com as opções Claro/Escuro — alterna o tema visual do sistema todo. */
export default function ThemeToggle({ variant = 'header' }: Props) {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const ActiveIcon = mode === 'dark' ? Moon : Sun

  return (
    <div className="hdr-theme-toggle" ref={wrapRef}>
      <button
        type="button"
        className={`hdr-theme-btn${variant === 'plain' ? ' plain' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="Tema claro ou escuro"
      >
        <ActiveIcon size={15} />
      </button>
      {open && (
        <div className="hdr-theme-panel">
          {OPTIONS.map(({ mode: optMode, label, Icon }) => (
            <button
              key={optMode}
              type="button"
              className={`hdr-theme-option${mode === optMode ? ' on' : ''}`}
              onClick={() => {
                setMode(optMode)
                setOpen(false)
              }}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
