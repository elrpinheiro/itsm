import { Fragment, useEffect, useRef, useState, type CSSProperties, type DragEvent, type PointerEvent as ReactPointerEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllProjects, useProjectTheme } from '@/store/useCatalogStore'
import { PROJECT_ALERTS, getAlertDescription, getAlertLevel, getAlertTotal } from '@/data/projectAlerts'
import type { Project, ProjectBrandId, ProjectTheme } from '@/types'

const STORAGE_KEY = 'itsm-proj-column-layout-v2'
const WIDTHS_STORAGE_KEY = 'itsm-proj-column-widths'
const NEW_COLUMN = '__new__'

const DEFAULT_COL_WIDTH = 240
const MIN_COL_WIDTH = 170
const MAX_COL_WIDTH = 440

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

function loadColumnWidths(): Record<string, number> {
  try {
    const raw = localStorage.getItem(WIDTHS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  } catch {
    /* localStorage indisponível ou dado corrompido — usa o padrão */
  }
  return {}
}

function ProjectRow({
  project,
  theme,
  onSelect,
  label,
}: {
  project: Project
  theme: ProjectTheme
  onSelect: (p: Project) => void
  label?: string
}) {
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
      <span className="proj-row-cidade">{label ?? project.cidade}</span>
    </button>
  )
}

function MatrizSection() {
  const navigate = useNavigate()
  const selectProject = useProjectStore((s) => s.selectProject)
  const allProjects = useAllProjects()
  const matrizes = allProjects.filter((p) => p.isMatriz)

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
  }

  return (
    <div className="proj-section">
      <div className="proj-section-title">Matriz</div>
      <div className="matriz-grid">
        {matrizes.map((project) => (
          <MatrizRow key={project.id} project={project} onSelect={handleSelect} />
        ))}
      </div>
    </div>
  )
}

function MatrizRow({ project, onSelect }: { project: Project; onSelect: (p: Project) => void }) {
  const theme = useProjectTheme(project.brandId)
  return <ProjectRow project={project} theme={theme} onSelect={onSelect} label={project.nome} />
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
  const projects = allProjects.filter((p) => p.brandId === brandId && !p.isMatriz)

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

export default function ProjectSelectionScreen() {
  const allProjects = useAllProjects()
  // só entram nas colunas de "Projetos" marcas que têm ao menos um projeto de campo (não-matriz)
  const fieldBrandIds = Array.from(new Set(allProjects.filter((p) => !p.isMatriz).map((p) => p.brandId)))

  const [layout, setLayout] = useState<ColumnData[]>(loadLayout)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(loadColumnWidths)
  const [dragOver, setDragOver] = useState<{ colId: string; brandId: ProjectBrandId | null } | null>(null)
  const [isDraggingAny, setIsDraggingAny] = useState(false)
  const draggedBrand = useRef<ProjectBrandId | null>(null)
  const resizeRef = useRef<{ colId: string; startX: number; startWidth: number } | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout))
  }, [layout])

  useEffect(() => {
    localStorage.setItem(WIDTHS_STORAGE_KEY, JSON.stringify(columnWidths))
  }, [columnWidths])

  function startColumnResize(colId: string) {
    return (e: ReactPointerEvent) => {
      resizeRef.current = { colId, startX: e.clientX, startWidth: columnWidths[colId] ?? DEFAULT_COL_WIDTH }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
  }
  function onColumnResizeMove(e: ReactPointerEvent) {
    const r = resizeRef.current
    if (!r) return
    const next = Math.min(MAX_COL_WIDTH, Math.max(MIN_COL_WIDTH, r.startWidth + (e.clientX - r.startX)))
    setColumnWidths((prev) => ({ ...prev, [r.colId]: next }))
  }
  function endColumnResize() {
    resizeRef.current = null
  }

  // mantém o layout salvo em sincronia com quem tem projeto de campo hoje: remove marcas que
  // ficaram sem nenhum (ex.: viraram só matriz) e acrescenta as novas na última coluna
  useEffect(() => {
    setLayout((prev) => {
      const fieldSet = new Set(fieldBrandIds)
      let changed = false
      let cols = prev
        .map((c) => {
          const filtered = c.brandIds.filter((id) => fieldSet.has(id))
          if (filtered.length !== c.brandIds.length) changed = true
          return { ...c, brandIds: filtered }
        })
        .filter((c) => c.brandIds.length > 0)

      const known = new Set(cols.flatMap((c) => c.brandIds))
      const missing = fieldBrandIds.filter((id) => !known.has(id))
      if (missing.length > 0) {
        changed = true
        if (cols.length === 0) {
          cols = [{ id: `col-${Date.now()}`, brandIds: missing }]
        } else {
          const last = { ...cols[cols.length - 1], brandIds: [...cols[cols.length - 1].brandIds, ...missing] }
          cols = [...cols.slice(0, -1), last]
        }
      }
      return changed ? cols : prev
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldBrandIds.join(',')])

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
    <div className="proj-select-wrap" onPointerMove={onColumnResizeMove} onPointerUp={endColumnResize} onPointerCancel={endColumnResize}>
      <div className="proj-select-title">
        <div style={{ fontWeight: 700, fontSize: 15 }}>Selecione um projeto</div>
      </div>

      <MatrizSection />

      <div className="proj-section">
        <div className="proj-section-title">Projetos</div>
        <div className="proj-columns">
          {layout.map((col) => (
            <Fragment key={col.id}>
              <div
                className={`proj-col-stack${dragOver?.colId === col.id && dragOver.brandId === null ? ' drag-target' : ''}`}
                style={{ width: columnWidths[col.id] ?? DEFAULT_COL_WIDTH }}
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
              <div className="proj-col-resize" onPointerDown={startColumnResize(col.id)} title="Arraste para redimensionar a coluna" />
            </Fragment>
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
    </div>
  )
}
