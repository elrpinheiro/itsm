import { useEffect, useRef, useState } from 'react'
import ProjectPickerList from '@/components/projects/ProjectPickerList'

/** Botão "Selecione o Projeto" do cabeçalho — abre um dropdown com a lista de projetos agrupada por marca. */
export default function ProjectPickerDropdown() {
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
      <button className="hdr-back-btn" onClick={() => setOpen((o) => !o)} title="Selecione o Projeto">
        <span>Selecione o Projeto</span>
      </button>
      {open && (
        <div className="proj-picker-panel">
          <ProjectPickerList onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  )
}
