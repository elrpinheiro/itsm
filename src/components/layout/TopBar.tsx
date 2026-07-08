import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useClock } from '@/hooks/useClock'

export default function TopBar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const project = useProjectStore((s) => s.selectedProject)
  const navigate = useNavigate()
  const clock = useClock()

  function handleLogout() {
    logout()
    useProjectStore.getState().clearProject()
    navigate('/login', { replace: true })
  }

  function handleVoltarProjetos() {
    navigate('/projects')
  }

  return (
    <div className="hdr-top">
      <div className="hdr-mark">V</div>
      <div className="hdr-brand">
        <div className="hdr-brand-name">Vitae ITSM</div>
        <div className="hdr-sub">v1.0 · MVP</div>
      </div>
      {project && (
        <div className="hdr-project">
          <img src={project.logo} alt={project.nome} className="hdr-project-logo" />
          <div className="hdr-project-text">
            <div className="hdr-project-name">{project.nome}</div>
            <div className="hdr-sub">{project.cidade}</div>
          </div>
          <button className="hdr-back-btn" onClick={handleVoltarProjetos} title="Voltar à seleção de projetos">
            ← <span>Projetos</span>
          </button>
        </div>
      )}
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
  )
}
