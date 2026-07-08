import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllBrandIds, useAllProjects, useProjectTheme } from '@/store/useCatalogStore'
import { PROJECT_ALERTS, getAlertDescription, getAlertLevel, getAlertTotal } from '@/data/projectAlerts'
import type { Project, ProjectBrandId } from '@/types'
import AddBrandModal from './AddBrandModal'
import AddProjectModal from './AddProjectModal'

type SlotId = 'left' | 'right'
type ColumnLayout = Record<SlotId, ProjectBrandId[]>

const STORAGE_KEY = 'itsm-proj-column-layout'

/** Arranjo padrão: Faz isolada à esquerda; Planneta e Educamundi empilhadas à direita. */
const DEFAULT_LAYOUT: ColumnLayout = { left: ['faz'], right: ['planneta', 'educamundi'] }

function loadLayout(): ColumnLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LAYOUT
    const parsed = JSON.parse(raw)
    const left: ProjectBrandId[] = Array.isArray(parsed?.left) ? parsed.left : []
    const right: ProjectBrandId[] = Array.isArray(parsed?.right) ? parsed.right : []
    if (left.length + right.length > 0) return { left, right }
  } catch {
    /* localStorage indisponível ou dado corrompido — usa o padrão */
  }
  return DEFAULT_LAYOUT
}

interface ProjectColumnProps {
  brandId: ProjectBrandId
  slot: SlotId
  isDragTarget: boolean
  onDragStart: (brandId: ProjectBrandId) => (e: DragEvent) => void
  onDragEnd: () => void
  onDragOver: (slot: SlotId, brandId: ProjectBrandId) => (e: DragEvent) => void
  onDrop: (slot: SlotId, brandId: ProjectBrandId) => (e: DragEvent) => void
}

function ProjectColumn({ brandId, slot, isDragTarget, onDragStart, onDragEnd, onDragOver, onDrop }: ProjectColumnProps) {
  const navigate = useNavigate()
  const selectProject = useProjectStore((s) => s.selectProject)
  const allProjects = useAllProjects()
  const theme = useProjectTheme(brandId)
  const projects = allProjects.filter((p) => p.brandId === brandId)

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
  }

  return (
    <div
      className={`proj-column${isDragTarget ? ' drag-target' : ''}`}
      onDragOver={onDragOver(slot, brandId)}
      onDrop={onDrop(slot, brandId)}
    >
      <div
        className="proj-column-header"
        style={{ borderBottomColor: theme.medio }}
        draggable
        onDragStart={onDragStart(brandId)}
        onDragEnd={onDragEnd}
        title="Arraste para mover este bloco"
      >
        <span className="proj-column-grip">⠿</span>
        <img src={theme.logo} alt={theme.label} className="proj-column-logo" />
        <div>
          <div className="proj-column-title">{theme.label}</div>
          <div className="proj-column-count">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      <div className="proj-column-list">
        {projects.map((project) => {
          const alert = PROJECT_ALERTS[project.id]
          const level = getAlertLevel(alert)
          return (
            <button
              key={project.id}
              className="proj-row"
              style={{ '--proj-accent': theme.medio } as CSSProperties}
              onClick={() => handleSelect(project)}
              title={project.nome}
            >
              <span className="proj-row-avatar">
                <span className="proj-row-avatar-inner">
                  <img src={project.logo} alt={project.nome} />
                </span>
                {level && (
                  <span className={`proj-alert-badge ${level}`} title={getAlertDescription(alert)}>
                    {getAlertTotal(alert)}
                  </span>
                )}
              </span>
              <span className="proj-row-cidade">{project.cidade}</span>
            </button>
          )
        })}
        {projects.length === 0 && <div className="proj-column-empty">Nenhum projeto cadastrado ainda.</div>}
      </div>
    </div>
  )
}

export default function ProjectSelectionScreen() {
  const isAdmin = useAuthStore((s) => s.user?.papel === 'Administrador')
  const allBrandIds = useAllBrandIds()

  const [layout, setLayout] = useState<ColumnLayout>(loadLayout)
  const [dragOver, setDragOver] = useState<{ slot: SlotId; brandId: ProjectBrandId | null } | null>(null)
  const [modal, setModal] = useState<'brand' | 'project' | null>(null)
  const draggedBrand = useRef<ProjectBrandId | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  // sempre que uma nova marca é cadastrada (pelo admin), acrescenta o bloco à direita automaticamente
  useEffect(() => {
    setLayout((prev) => {
      const known = new Set([...prev.left, ...prev.right])
      const missing = allBrandIds.filter((id) => !known.has(id))
      if (missing.length === 0) return prev
      return { ...prev, right: [...prev.right, ...missing] }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allBrandIds.join(',')])

  function moveBrand(brandId: ProjectBrandId, targetSlot: SlotId, beforeBrand?: ProjectBrandId) {
    setLayout((prev) => {
      const cleaned: ColumnLayout = {
        left: prev.left.filter((b) => b !== brandId),
        right: prev.right.filter((b) => b !== brandId),
      }
      const arr = [...cleaned[targetSlot]]
      const insertAt = beforeBrand ? arr.indexOf(beforeBrand) : -1
      arr.splice(insertAt === -1 ? arr.length : insertAt, 0, brandId)
      return { ...cleaned, [targetSlot]: arr }
    })
  }

  function handleDragStart(brandId: ProjectBrandId) {
    return (e: DragEvent) => {
      draggedBrand.current = brandId
      e.dataTransfer.effectAllowed = 'move'
    }
  }
  function handleDragEnd() {
    draggedBrand.current = null
    setDragOver(null)
  }
  function handleColumnDragOver(slot: SlotId, brandId: ProjectBrandId) {
    return (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (dragOver?.slot !== slot || dragOver?.brandId !== brandId) setDragOver({ slot, brandId })
    }
  }
  function handleColumnDrop(slot: SlotId, brandId: ProjectBrandId) {
    return (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const dragged = draggedBrand.current
      if (dragged && dragged !== brandId) moveBrand(dragged, slot, brandId)
      draggedBrand.current = null
      setDragOver(null)
    }
  }
  function handleSlotDragOver(slot: SlotId) {
    return (e: DragEvent) => {
      e.preventDefault()
      if (dragOver?.slot !== slot || dragOver?.brandId !== null) setDragOver({ slot, brandId: null })
    }
  }
  function handleSlotDrop(slot: SlotId) {
    return (e: DragEvent) => {
      e.preventDefault()
      const dragged = draggedBrand.current
      if (dragged) moveBrand(dragged, slot)
      draggedBrand.current = null
      setDragOver(null)
    }
  }

  return (
    <div className="proj-select-wrap">
      <div className="proj-select-title">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Selecione um projeto</div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
              <button className="btn admin-add-btn" onClick={() => setModal('brand')}>
                + Empresa
              </button>
              <button className="btn admin-add-btn" onClick={() => setModal('project')}>
                + Projeto
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="proj-columns">
        {(['left', 'right'] as SlotId[]).map((slot) => (
          <div
            key={slot}
            className={`proj-col-stack${dragOver?.slot === slot && dragOver.brandId === null ? ' drag-target' : ''}`}
            onDragOver={handleSlotDragOver(slot)}
            onDrop={handleSlotDrop(slot)}
          >
            {layout[slot].map((brandId) => (
              <ProjectColumn
                key={brandId}
                brandId={brandId}
                slot={slot}
                isDragTarget={dragOver?.slot === slot && dragOver.brandId === brandId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleColumnDragOver}
                onDrop={handleColumnDrop}
              />
            ))}
          </div>
        ))}
      </div>

      {modal === 'brand' && <AddBrandModal onClose={() => setModal(null)} />}
      {modal === 'project' && <AddProjectModal onClose={() => setModal(null)} />}
    </div>
  )
}
