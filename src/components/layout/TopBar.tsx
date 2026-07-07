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
      <div>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, lineHeight: 1.1 }}>Vitae ITSM</div>
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 10.5 }}>v1.0 · MVP</div>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.75)' }}>{clock}</span>
        <div className="hdr-ava">{user?.iniciais ?? ''}</div>
        <div style={{ lineHeight: 1.15 }}>
          <div style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{user?.nome ?? ''}</div>
          <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 10.5 }}>{user?.papel ?? ''}</div>
        </div>
        <span
          style={{ color: 'rgba(255,255,255,.6)', cursor: 'pointer', fontSize: 16 }}
          title="Sair"
          onClick={handleLogout}
        >
          ⏻
        </span>
      </div>
    </div>
  )
}
