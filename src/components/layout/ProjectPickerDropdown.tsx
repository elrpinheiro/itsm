import { useEffect, useRef, useState } from 'react'
import ProjectPickerList from '@/components/projects/ProjectPickerList'

interface Props {
  /** Texto do botão — "Selecione a Entidade" (sem projeto ativo) ou "Projetos" (dentro de um projeto). */
  label?: string
  /** Mostra a seta "←" antes do texto — usado quando o botão troca de projeto a partir de dentro de um já ativo. */
  showArrow?: boolean
}

/** Botão do cabeçalho que abre um dropdown com a lista de projetos agrupada por marca — funciona tanto
 * sem projeto ativo ("Selecione a Entidade") quanto dentro de um projeto ("← Projetos", trocar de unidade). */
export default function ProjectPickerDropdown({ label = 'Selecione a Entidade', showArrow = false }: Props) {
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

  return (
    <div className="proj-picker" ref={wrapRef}>
      <button className="hdr-back-btn" onClick={() => setOpen((o) => !o)} title={label}>
        {showArrow && '← '}
        <span>{label}</span>
      </button>
      {open && (
        <div className="proj-picker-panel">
          <ProjectPickerList onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
