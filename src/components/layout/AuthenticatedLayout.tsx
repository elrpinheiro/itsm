import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, FileText, LogOut, Phone, MessageCircle } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useProjectTheme } from '@/store/useCatalogStore'
import ModuleTabs from './ModuleTabs'
import ProjectPickerDropdown from './ProjectPickerDropdown'
import OperationPanel from './OperationPanel'
import { VtcallPlaceholder, MktzapPlaceholder } from './operationPlaceholders'
import vtcallLogo from '@/assets/logos/vtcall.png'
import whatsappLogo from '@/assets/logos/WhatsApp.png'

const VTCALL_URL = 'https://vitae.vtcall.app/auth/'
const MKTZAP_URL = 'https://mktzap.com.br/login'
const MANUAL_USUARIO_URL = 'https://claude.ai/code/artifact/4540c7af-cdde-45f7-9a49-94ab89582360'
const DOCUMENTACAO_TECNICA_URL = 'https://claude.ai/code/artifact/2745fefc-6654-43b7-a64e-bd679a8e5067'

const PANELS_MIN_WIDTH = 280
const PANELS_MAX_WIDTH = 720
const PANELS_DEFAULT_WIDTH = 360
const SPLIT_MIN = 20
const SPLIT_MAX = 80

const FLOAT_WIDTH = 340
const FLOAT_EDGE_THRESHOLD = 40
const EDGE_TAB_HEIGHT = 58
const EDGE_TAB_GAP = 8
const EDGE_TAB_BASE_Y = 90

type DragMode =
  | { kind: 'width'; startX: number; startWidth: number }
  | { kind: 'split'; startY: number; startSplit: number }
  | { kind: 'float'; which: 'vtcall' | 'mktzap'; startX: number; startY: number; startPosX: number; startPosY: number }

interface FloatPos {
  x: number
  y: number
}

export default function AuthenticatedLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const project = useProjectStore((s) => s.selectedProject)
  const navigate = useNavigate()

  const [vtcallUrl, setVtcallUrl] = useState<string | null>(null)
  const [mktzapUrl, setMktzapUrl] = useState<string | null>(null)
  const [panelsWidth, setPanelsWidth] = useState(PANELS_DEFAULT_WIDTH)
  const [split, setSplit] = useState(50)

  const [poppedVtcall, setPoppedVtcall] = useState(false)
  const [poppedMktzap, setPoppedMktzap] = useState(false)
  const [minimizedVtcall, setMinimizedVtcall] = useState(true)
  const [minimizedMktzap, setMinimizedMktzap] = useState(true)
  const [edgeVtcall, setEdgeVtcall] = useState(false)
  const [edgeMktzap, setEdgeMktzap] = useState(false)
  const [posVtcall, setPosVtcall] = useState<FloatPos>({ x: 60, y: 90 })
  const [posMktzap, setPosMktzap] = useState<FloatPos>({ x: 430, y: 90 })

  const panelsRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragMode | null>(null)

  const theme = useProjectTheme(project?.brandId ?? 'planneta')
  const themeVars = {
    '--tema-escuro': theme.escuro,
    '--tema': theme.medio,
    '--tema-pale': theme.pale,
    '--tema-texto': theme.texto,
    '--tema-accento': theme.accento,
  } as CSSProperties

  function handleLogout() {
    logout()
    useProjectStore.getState().clearProject()
    navigate('/login', { replace: true })
  }

  function startWidthDrag(e: ReactPointerEvent) {
    dragRef.current = { kind: 'width', startX: e.clientX, startWidth: panelsWidth }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function startSplitDrag(e: ReactPointerEvent) {
    dragRef.current = { kind: 'split', startY: e.clientY, startSplit: split }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function startFloatDrag(which: 'vtcall' | 'mktzap', e: ReactPointerEvent) {
    const pos = which === 'vtcall' ? posVtcall : posMktzap
    dragRef.current = { kind: 'float', which, startX: e.clientX, startY: e.clientY, startPosX: pos.x, startPosY: pos.y }
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onDrag(e: ReactPointerEvent) {
    const drag = dragRef.current
    if (!drag) return
    if (drag.kind === 'width') {
      const delta = drag.startX - e.clientX
      setPanelsWidth(Math.min(PANELS_MAX_WIDTH, Math.max(PANELS_MIN_WIDTH, drag.startWidth + delta)))
    } else if (drag.kind === 'split') {
      const containerHeight = panelsRef.current?.clientHeight ?? 1
      const deltaPct = ((e.clientY - drag.startY) / containerHeight) * 100
      setSplit(Math.min(SPLIT_MAX, Math.max(SPLIT_MIN, drag.startSplit + deltaPct)))
    } else {
      const nx = Math.min(Math.max(drag.startPosX + (e.clientX - drag.startX), 0), Math.max(0, window.innerWidth - FLOAT_WIDTH))
      const ny = Math.min(Math.max(drag.startPosY + (e.clientY - drag.startY), 0), Math.max(0, window.innerHeight - 44))
      if (drag.which === 'vtcall') setPosVtcall({ x: nx, y: ny })
      else setPosMktzap({ x: nx, y: ny })
    }
  }
  function endDrag(e: ReactPointerEvent) {
    const drag = dragRef.current
    if (drag?.kind === 'float' && e.clientX > window.innerWidth - FLOAT_EDGE_THRESHOLD) {
      if (drag.which === 'vtcall') setEdgeVtcall(true)
      else setEdgeMktzap(true)
    }
    dragRef.current = null
  }

  function toggleMinimizedVtcall() {
    setMinimizedVtcall((prev) => {
      const next = !prev
      if (!next) setVtcallUrl(VTCALL_URL)
      return next
    })
  }
  function toggleMinimizedMktzap() {
    setMinimizedMktzap((prev) => {
      const next = !prev
      if (!next) setMktzapUrl(MKTZAP_URL)
      return next
    })
  }

  function restoreFromEdge(which: 'vtcall' | 'mktzap') {
    const y = Math.min(Math.max((which === 'vtcall' ? posVtcall.y : posMktzap.y), 0), window.innerHeight - 44)
    const x = Math.max(0, window.innerWidth - FLOAT_WIDTH - 24)
    if (which === 'vtcall') {
      setPosVtcall({ x, y })
      setEdgeVtcall(false)
    } else {
      setPosMktzap({ x, y })
      setEdgeMktzap(false)
    }
  }

  const dockedCount = (poppedVtcall ? 0 : 1) + (poppedMktzap ? 0 : 1)
  const hasFullDockedPanel = (!poppedVtcall && !minimizedVtcall) || (!poppedMktzap && !minimizedMktzap)
  const compactDock = dockedCount > 0 && !hasFullDockedPanel

  const edgeHiddenTabs = [
    poppedVtcall && edgeVtcall ? { which: 'vtcall' as const, logo: vtcallLogo, title: 'Mostrar Vtcall' } : null,
    poppedMktzap && edgeMktzap ? { which: 'mktzap' as const, logo: whatsappLogo, title: 'Mostrar MKTZAP' } : null,
  ].filter((t): t is { which: 'vtcall' | 'mktzap'; logo: string; title: string } => t !== null)

  return (
    <div className="op-layout" style={themeVars} onPointerMove={onDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <div className="hdr-top op-topbar">
        <button
          type="button"
          className="hdr-mark"
          onClick={() => {
            useProjectStore.getState().clearProject()
            navigate('/projects')
          }}
          title="Ver Painel Geral"
        >
          V
        </button>

        {project ? (
          <div className="hdr-project">
            <img src={project.logo} alt={project.nome} className="hdr-project-logo" />
            <div className="hdr-project-text">
              <div className="hdr-project-name">{project.nome}</div>
              <div className="hdr-sub">{project.cidade}</div>
            </div>
            <ProjectPickerDropdown label="Projetos" showArrow />
          </div>
        ) : (
          <div className="hdr-project hdr-project-empty">
            <ProjectPickerDropdown />
          </div>
        )}

        <div className="hdr-right">
          <div className="hdr-doc-links">
            <a
              className="hdr-doc-link"
              href={MANUAL_USUARIO_URL}
              target="_blank"
              rel="noreferrer"
              title="Manual do usuário"
            >
              <BookOpen size={14} /> <span>Manual do usuário</span>
            </a>
            <a
              className="hdr-doc-link"
              href={DOCUMENTACAO_TECNICA_URL}
              target="_blank"
              rel="noreferrer"
              title="Documentação técnica"
            >
              <FileText size={14} /> <span>Documentação técnica</span>
            </a>
          </div>
          <div className="hdr-ava">{user?.iniciais ?? ''}</div>
          <div className="hdr-user-text">
            <div className="hdr-user-name">{user?.nome ?? ''}</div>
            <div className="hdr-sub">{user?.papel ?? ''}</div>
          </div>
          <button className="hdr-logout" title="Sair" onClick={handleLogout}>
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <ModuleTabs />

      <div className="op-body">
        <div className="op-main">
          <Outlet />
        </div>
        {dockedCount > 0 && (
          <>
            {!compactDock && <div className="op-divider-v" onPointerDown={startWidthDrag} title="Arraste para redimensionar" />}
            <div className={`op-panels${compactDock ? ' compact' : ''}`} style={{ width: compactDock ? 68 : panelsWidth }} ref={panelsRef}>
              {!poppedVtcall && (
                <OperationPanel
                  title="Vtcall"
                  subtitle="Ligações em tempo real"
                  logo={vtcallLogo}
                  miniIcon={Phone}
                  miniColor="var(--azul-escuro)"
                  placeholder={<VtcallPlaceholder />}
                  url={vtcallUrl}
                  externalUrl={VTCALL_URL}
                  flexBasisPct={poppedMktzap || minimizedMktzap ? 100 : split}
                  popped={false}
                  onTogglePop={() => setPoppedVtcall(true)}
                  minimized={minimizedVtcall}
                  onToggleMinimize={toggleMinimizedVtcall}
                />
              )}
              {dockedCount === 2 && !minimizedVtcall && !minimizedMktzap && (
                <div className="op-divider-h" onPointerDown={startSplitDrag} title="Arraste para redimensionar" />
              )}
              {!poppedMktzap && (
                <OperationPanel
                  title="MKTZAP"
                  subtitle="Atendimento via WhatsApp"
                  logo={whatsappLogo}
                  miniIcon={MessageCircle}
                  miniColor="var(--verde)"
                  placeholder={<MktzapPlaceholder />}
                  url={mktzapUrl}
                  externalUrl={MKTZAP_URL}
                  flexBasisPct={poppedVtcall || minimizedVtcall ? 100 : 100 - split}
                  popped={false}
                  onTogglePop={() => setPoppedMktzap(true)}
                  minimized={minimizedMktzap}
                  onToggleMinimize={toggleMinimizedMktzap}
                />
              )}
            </div>
          </>
        )}
      </div>

      {poppedVtcall && !edgeVtcall && (
        <div className="floating-panel" style={{ left: posVtcall.x, top: posVtcall.y, width: FLOAT_WIDTH }}>
          <OperationPanel
            title="Vtcall"
            subtitle="Ligações em tempo real"
            logo={vtcallLogo}
            miniIcon={Phone}
            miniColor="var(--azul-escuro)"
            placeholder={<VtcallPlaceholder />}
            url={vtcallUrl}
            externalUrl={VTCALL_URL}
            popped
            onTogglePop={() => setPoppedVtcall(false)}
            minimized={minimizedVtcall}
            onToggleMinimize={toggleMinimizedVtcall}
            onDragHandlePointerDown={(e) => startFloatDrag('vtcall', e)}
            onHideToEdge={() => setEdgeVtcall(true)}
          />
        </div>
      )}
      {poppedMktzap && !edgeMktzap && (
        <div className="floating-panel" style={{ left: posMktzap.x, top: posMktzap.y, width: FLOAT_WIDTH }}>
          <OperationPanel
            title="MKTZAP"
            subtitle="Atendimento via WhatsApp"
            logo={whatsappLogo}
            miniIcon={MessageCircle}
            miniColor="var(--verde)"
            placeholder={<MktzapPlaceholder />}
            url={mktzapUrl}
            externalUrl={MKTZAP_URL}
            popped
            onTogglePop={() => setPoppedMktzap(false)}
            minimized={minimizedMktzap}
            onToggleMinimize={toggleMinimizedMktzap}
            onDragHandlePointerDown={(e) => startFloatDrag('mktzap', e)}
            onHideToEdge={() => setEdgeMktzap(true)}
          />
        </div>
      )}
      {edgeHiddenTabs.map((tab, i) => (
        <button
          key={tab.which}
          className="floating-edge-tab"
          style={{ top: EDGE_TAB_BASE_Y + i * (EDGE_TAB_HEIGHT + EDGE_TAB_GAP) }}
          onClick={() => restoreFromEdge(tab.which)}
          title={tab.title}
        >
          <img src={tab.logo} alt={tab.title} />
        </button>
      ))}
    </div>
  )
}
