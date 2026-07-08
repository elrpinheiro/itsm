import { useEffect, useRef, useState, type CSSProperties, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllBrandIds, useAllProjects, useProjectTheme } from '@/store/useCatalogStore'
import { PROJECT_ALERTS, getAlertDescription, getAlertLevel, getAlertTotal } from '@/data/projectAlerts'
import type { Project, ProjectBrandId, ProjectTheme } from '@/types'

/** Vitae Brasil é a empresa do grupo — fica fixa em um banner acima de todas as demais, não faz parte das colunas arrastáveis. */
const GROUP_BRAND_ID: ProjectBrandId = 'vitae-brasil'
const STORAGE_KEY = 'itsm-proj-column-layout-v2'
const NEW_COLUMN = '__new__'

interface ColumnData {
  id: string
  brandIds: ProjectBrandId[]
}

const DEFAULT_LAYOUT: ColumnData[] = [
  { id: 'col-faz', brandIds: ['faz'] },
  { id: 'col-outras', brandIds: ['planneta', 'educamundi'] },
]

function loadLayout(): ColumnData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_LAYOUT
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every((c) => c && typeof c.id === 'string' && Array.isArray(c.brandIds))) {
      const flat = (parsed as ColumnData[]).flatMap((c) => c.brandIds)
      if (flat.length > 0) return parsed
    }
  } catch {
    /* localStorage indisponível ou dado corrompido — usa o padrão */
  }
  return DEFAULT_LAYOUT
}

function ProjectRow({ project, theme, onSelect }: { project: Project; theme: ProjectTheme; onSelect: (p: Project) => void }) {
  const alert = PROJECT_ALERTS[project.id]
  const level = getAlertLevel(alert)
  return (
    <button
      className="proj-row"
      style={{ '--proj-accent': theme.medio, '--proj-accent-pale': theme.pale } as CSSProperties}
      onClick={() => onSelect(project)}
      title={project.nome}
    >
      <span className="proj-row-avatar">
        <span className="proj-row-avatar-inner">
          <span className="proj-row-avatar-clip">
            <img src={project.logo} alt={project.nome} />
          </span>
          {level && (
            <span className={`proj-alert-badge ${level}`} title={getAlertDescription(alert)}>
              {getAlertTotal(alert)}
            </span>
          )}
        </span>
      </span>
      <span className="proj-row-cidade">{project.cidade}</span>
    </button>
  )
}

interface BrandBlockProps {
  brandId: ProjectBrandId
  colId: string
  isDragTarget: boolean
  onDragStart: (brandId: ProjectBrandId) => (e: DragEvent) => void
  onDragEnd: () => void
  onDragOver: (colId: string, brandId: ProjectBrandId) => (e: DragEvent) => void
  onDrop: (colId: string, brandId: ProjectBrandId) => (e: DragEvent) => void
}

function BrandBlock({ brandId, colId, isDragTarget, onDragStart, onDragEnd, onDragOver, onDrop }: BrandBlockProps) {
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
      onDragOver={onDragOver(colId, brandId)}
      onDrop={onDrop(colId, brandId)}
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
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} theme={theme} onSelect={handleSelect} />
        ))}
        {projects.length === 0 && <div className="proj-column-empty">Nenhum projeto cadastrado ainda.</div>}
      </div>
    </div>
  )
}

function GroupBanner() {
  const navigate = useNavigate()
  const selectProject = useProjectStore((s) => s.selectProject)
  const allProjects = useAllProjects()
  const theme = useProjectTheme(GROUP_BRAND_ID)
  const projects = allProjects.filter((p) => p.brandId === GROUP_BRAND_ID)

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
  }

  return (
    <div className="proj-group-banner" style={{ borderColor: theme.medio, background: theme.pale }}>
      <img src={theme.logo} alt={theme.label} className="proj-group-banner-logo" />
      <div className="proj-group-banner-text">
        <div className="proj-group-banner-title">{theme.label}</div>
        <div className="proj-group-banner-sub" style={{ color: theme.texto }}>
          Empresa do grupo · {projects.length} projeto{projects.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div className="proj-group-banner-list">
        {projects.map((project) => (
          <ProjectRow key={project.id} project={project} theme={theme} onSelect={handleSelect} />
        ))}
        {projects.length === 0 && <div className="proj-group-banner-empty">Nenhum projeto cadastrado ainda.</div>}
      </div>
    </div>
  )
}

export default function ProjectSelectionScreen() {
  const allBrandIds = useAllBrandIds()
  const draggableBrandIds = allBrandIds.filter((id) => id !== GROUP_BRAND_ID)

  const [layout, setLayout] = useState<ColumnData[]>(loadLayout)
  const [dragOver, setDragOver] = useState<{ colId: string; brandId: ProjectBrandId | null } | null>(null)
  const [isDraggingAny, setIsDraggingAny] = useState(false)
  const draggedBrand = useRef<ProjectBrandId | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  // sempre que uma nova marca é cadastrada, acrescenta o bloco na última coluna automaticamente
  useEffect(() => {
    setLayout((prev) => {
      const known = new Set(prev.flatMap((c) => c.brandIds))
      const missing = draggableBrandIds.filter((id) => !known.has(id))
      if (missing.length === 0) return prev
      if (prev.length === 0) return [{ id: `col-${Date.now()}`, brandIds: missing }]
      const next = prev.map((c) => ({ ...c }))
      next[next.length - 1] = { ...next[next.length - 1], brandIds: [...next[next.length - 1].brandIds, ...missing] }
      return next
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggableBrandIds.join(',')])

  function moveBrand(brandId: ProjectBrandId, targetColId: string, beforeBrand?: ProjectBrandId) {
    setLayout((prev) => {
      let cols = prev.map((c) => ({ ...c, brandIds: c.brandIds.filter((b) => b !== brandId) })).filter((c) => c.brandIds.length > 0)
      if (targetColId === NEW_COLUMN) {
        cols = [...cols, { id: `col-${Date.now()}`, brandIds: [brandId] }]
      } else {
        const idx = cols.findIndex((c) => c.id === targetColId)
        if (idx === -1) {
          cols = [...cols, { id: targetColId, brandIds: [brandId] }]
        } else {
          const arr = [...cols[idx].brandIds]
          const insertAt = beforeBrand ? arr.indexOf(beforeBrand) : -1
          arr.splice(insertAt === -1 ? arr.length : insertAt, 0, brandId)
          cols[idx] = { ...cols[idx], brandIds: arr }
        }
      }
      return cols
    })
  }

  function handleDragStart(brandId: ProjectBrandId) {
    return (e: DragEvent) => {
      draggedBrand.current = brandId
      setIsDraggingAny(true)
      e.dataTransfer.effectAllowed = 'move'
    }
  }
  function handleDragEnd() {
    draggedBrand.current = null
    setIsDraggingAny(false)
    setDragOver(null)
  }
  function handleColumnDragOver(colId: string, brandId: ProjectBrandId) {
    return (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (dragOver?.colId !== colId || dragOver?.brandId !== brandId) setDragOver({ colId, brandId })
    }
  }
  function handleColumnDrop(colId: string, brandId: ProjectBrandId) {
    return (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const dragged = draggedBrand.current
      if (dragged && dragged !== brandId) moveBrand(dragged, colId, brandId)
      draggedBrand.current = null
      setIsDraggingAny(false)
      setDragOver(null)
    }
  }
  function handleStackDragOver(colId: string) {
    return (e: DragEvent) => {
      e.preventDefault()
      if (dragOver?.colId !== colId || dragOver?.brandId !== null) setDragOver({ colId, brandId: null })
    }
  }
  function handleStackDrop(colId: string) {
    return (e: DragEvent) => {
      e.preventDefault()
      const dragged = draggedBrand.current
      if (dragged) moveBrand(dragged, colId)
      draggedBrand.current = null
      setIsDraggingAny(false)
      setDragOver(null)
    }
  }
  function handleNewColumnDragOver(e: DragEvent) {
    e.preventDefault()
    if (dragOver?.colId !== NEW_COLUMN) setDragOver({ colId: NEW_COLUMN, brandId: null })
  }
  function handleNewColumnDrop(e: DragEvent) {
    e.preventDefault()
    const dragged = draggedBrand.current
    if (dragged) moveBrand(dragged, NEW_COLUMN)
    draggedBrand.current = null
    setIsDraggingAny(false)
    setDragOver(null)
  }

  return (
    <div className="proj-select-wrap">
      <div className="proj-select-title">
        <div style={{ fontWeight: 700, fontSize: 15 }}>Selecione um projeto</div>
      </div>

      <GroupBanner />

      <div className="proj-columns">
        {layout.map((col) => (
          <div
            key={col.id}
            className={`proj-col-stack${dragOver?.colId === col.id && dragOver.brandId === null ? ' drag-target' : ''}`}
            onDragOver={handleStackDragOver(col.id)}
            onDrop={handleStackDrop(col.id)}
          >
            {col.brandIds.map((brandId) => (
              <BrandBlock
                key={brandId}
                brandId={brandId}
                colId={col.id}
                isDragTarget={dragOver?.colId === col.id && dragOver.brandId === brandId}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleColumnDragOver}
                onDrop={handleColumnDrop}
              />
            ))}
          </div>
        ))}
        <div
          className={`proj-col-newzone${isDraggingAny ? ' active' : ''}${dragOver?.colId === NEW_COLUMN ? ' drag-target' : ''}`}
          onDragOver={handleNewColumnDragOver}
          onDrop={handleNewColumnDrop}
        >
          {isDraggingAny && <span className="proj-col-newzone-hint">Solte aqui para criar uma nova coluna</span>}
        </div>
      </div>
    </div>
  )
}
