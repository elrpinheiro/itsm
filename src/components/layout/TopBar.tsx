import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useClock } from '@/hooks/useClock'

export default function TopBar() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const clock = useClock()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="hdr-top">
      <div className="hdr-mark">V</div>
      <div className="hdr-brand">
        <div className="hdr-brand-name">Vitae ITSM</div>
        <div className="hdr-sub">v1.0 · MVP</div>
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
  )
}
