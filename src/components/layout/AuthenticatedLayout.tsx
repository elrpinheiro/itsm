import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { PROJECT_THEMES } from '@/data/projectThemes'
import { useClock } from '@/hooks/useClock'
import OperationPanel from './OperationPanel'
import { VtcallPlaceholder, MktzapPlaceholder } from './operationPlaceholders'
import vtcallLogo from '@/assets/logos/vtcall.png'
import whatsappLogo from '@/assets/logos/WhatsApp.png'

const VTCALL_URL = 'https://vitae.vtcall.app/auth/'
const MKTZAP_URL = 'https://mktzap.com.br/login'

const PANELS_MIN_WIDTH = 280
const PANELS_MAX_WIDTH = 720
const PANELS_DEFAULT_WIDTH = 360
const SPLIT_MIN = 20
const SPLIT_MAX = 80

type FloatId = 'vtcall' | 'mktzap'
type FloatPos = { top: number; left: number }

type DragMode =
  | { kind: 'width'; startX: number; startWidth: number }
  | { kind: 'split'; startY: number; startSplit: number }
  | { kind: 'float'; id: FloatId; startX: number; startY: number; startTop: number; startLeft: number }

export default function AuthenticatedLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const project = useProjectStore((s) => s.selectedProject)
  const navigate = useNavigate()
  const location = useLocation()
  const clock = useClock()

  const [vtcallUrl, setVtcallUrl] = useState<string | null>(null)
  const [mktzapUrl, setMktzapUrl] = useState<string | null>(null)
  const [panelsWidth, setPanelsWidth] = useState(PANELS_DEFAULT_WIDTH)
  const [split, setSplit] = useState(50)

  const [poppedVtcall, setPoppedVtcall] = useState(false)
  const [poppedMktzap, setPoppedMktzap] = useState(false)
  const [floatPos, setFloatPos] = useState<Record<FloatId, FloatPos | null>>({ vtcall: null, mktzap: null })

  const panelsRef = useRef<HTMLDivElement>(null)
  const vtcallFloatRef = useRef<HTMLDivElement>(null)
  const mktzapFloatRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<DragMode | null>(null)

  const theme = PROJECT_THEMES[project?.brandId ?? 'planneta']
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
  function startFloatDrag(id: FloatId, ref: React.RefObject<HTMLDivElement>) {
    return (e: ReactPointerEvent) => {
      const rect = ref.current?.getBoundingClientRect()
      const current = floatPos[id] ?? { top: rect?.top ?? 90, left: rect?.left ?? 90 }
      dragRef.current = { kind: 'float', id, startX: e.clientX, startY: e.clientY, startTop: current.top, startLeft: current.left }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    }
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
      const left = Math.max(0, drag.startLeft + (e.clientX - drag.startX))
      const top = Math.max(0, drag.startTop + (e.clientY - drag.startY))
      setFloatPos((prev) => ({ ...prev, [drag.id]: { top, left } }))
    }
  }
  function endDrag() {
    dragRef.current = null
  }

  const insideApp = location.pathname.startsWith('/app') && !!project
  const dockedCount = (poppedVtcall ? 0 : 1) + (poppedMktzap ? 0 : 1)

  return (
    <div className="op-layout" style={themeVars} onPointerMove={onDrag} onPointerUp={endDrag} onPointerCancel={endDrag}>
      <div className="hdr-top op-topbar">
        <div className="hdr-mark">V</div>
        <div className="hdr-brand">
          <div className="hdr-brand-name">Vitae ITSM</div>
          <div className="hdr-sub">v1.0 · MVP</div>
        </div>

        {insideApp && project && (
          <div className="hdr-project">
            <img src={project.logo} alt={project.nome} className="hdr-project-logo" />
            <div className="hdr-project-text">
              <div className="hdr-project-name">{project.nome}</div>
              <div className="hdr-sub">{project.cidade}</div>
            </div>
            <button className="hdr-back-btn" onClick={() => navigate('/projects')} title="Voltar à seleção de projetos">
              ← <span>Projetos</span>
            </button>
          </div>
        )}

        <div className="op-actions">
          <span className="op-actions-label">Entrar em Operação</span>
          <button className={`op-btn${vtcallUrl ? ' on' : ''}`} onClick={() => setVtcallUrl(VTCALL_URL)}>
            <img src={vtcallLogo} alt="" /> Vtcall
          </button>
          <button className={`op-btn${mktzapUrl ? ' on' : ''}`} onClick={() => setMktzapUrl(MKTZAP_URL)}>
            <img src={whatsappLogo} alt="" /> MKTZAP
          </button>
        </div>

        <div className="hdr-right">
          <span className="hdr-clock">{clock}</span>
          <div className="hdr-ava">{user?.iniciais ?? ''}</div>
          <div className="hdr-user-text">
            <div className="hdr-user-name">{user?.nome ?? ''}</div>
            <div className="hdr-sub">{user?.papel ?? ''}</div>
          </div>
          <span className="hdr-logout" title="Sair" onClick={handleLogout}>
            ⏻
          </span>
        </div>
      </div>

      <div className="op-body">
        <div className="op-main">
          <Outlet />
        </div>
        {dockedCount > 0 && (
          <>
            <div className="op-divider-v" onPointerDown={startWidthDrag} title="Arraste para redimensionar" />
            <div className="op-panels" style={{ width: panelsWidth }} ref={panelsRef}>
              {!poppedVtcall && (
                <OperationPanel
                  title="Vtcall"
                  subtitle="Ligações em tempo real"
                  logo={vtcallLogo}
                  placeholder={<VtcallPlaceholder />}
                  url={vtcallUrl}
                  externalUrl={VTCALL_URL}
                  flexBasisPct={poppedMktzap ? 100 : split}
                  popped={false}
                  onTogglePop={() => setPoppedVtcall(true)}
                />
              )}
              {dockedCount === 2 && <div className="op-divider-h" onPointerDown={startSplitDrag} title="Arraste para redimensionar" />}
              {!poppedMktzap && (
                <OperationPanel
                  title="MKTZAP"
                  subtitle="Atendimento via WhatsApp"
                  logo={whatsappLogo}
                  placeholder={<MktzapPlaceholder />}
                  url={mktzapUrl}
                  externalUrl={MKTZAP_URL}
                  flexBasisPct={poppedVtcall ? 100 : 100 - split}
                  popped={false}
                  onTogglePop={() => setPoppedMktzap(true)}
                />
              )}
            </div>
          </>
        )}
      </div>

      {poppedVtcall && (
        <div
          className="op-float"
          ref={vtcallFloatRef}
          style={floatPos.vtcall ? { top: floatPos.vtcall.top, left: floatPos.vtcall.left, right: 'auto', bottom: 'auto' } : undefined}
        >
          <OperationPanel
            title="Vtcall"
            subtitle="Ligações em tempo real"
            logo={vtcallLogo}
            placeholder={<VtcallPlaceholder />}
            url={vtcallUrl}
            externalUrl={VTCALL_URL}
            popped
            onTogglePop={() => setPoppedVtcall(false)}
            onHeaderPointerDown={startFloatDrag('vtcall', vtcallFloatRef)}
          />
        </div>
      )}
      {poppedMktzap && (
        <div
          className="op-float op-float-mktzap"
          ref={mktzapFloatRef}
          style={floatPos.mktzap ? { top: floatPos.mktzap.top, left: floatPos.mktzap.left, right: 'auto', bottom: 'auto' } : undefined}
        >
          <OperationPanel
            title="MKTZAP"
            subtitle="Atendimento via WhatsApp"
            logo={whatsappLogo}
            placeholder={<MktzapPlaceholder />}
            url={mktzapUrl}
            externalUrl={MKTZAP_URL}
            popped
            onTogglePop={() => setPoppedMktzap(false)}
            onHeaderPointerDown={startFloatDrag('mktzap', mktzapFloatRef)}
          />
        </div>
      )}
    </div>
  )
}
