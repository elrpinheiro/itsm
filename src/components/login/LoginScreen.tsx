import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('admin@vitaebrasil.com.br')
  const [senha, setSenha] = useState('12345678')

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!login(email, senha)) {
      alert('Informe usuário e senha.')
      return
    }
    navigate('/projects', { replace: true })
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">V</div>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--azul-escuro)' }}>Vitae ITSM</div>
          <div style={{ fontSize: 12.5, color: 'var(--texto-sec)', marginTop: 3 }}>
            Central de Atendimentos e Serviços
          </div>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="frow">
            <label className="field-label">Usuário</label>
            <input
              type="text"
              placeholder="seu.nome@vitaebrasil.com.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="frow" style={{ marginBottom: 6 }}>
            <label className="field-label">Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>
          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <a
              href="#"
              style={{ fontSize: 12, color: 'var(--azul)', textDecoration: 'none', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault()
                alert('No sistema real: fluxo de recuperação de senha por e-mail.')
              }}
            >
              Esqueci minha senha
            </a>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: 11, fontSize: 14, fontWeight: 600 }}
          >
            Entrar
          </button>
        </form>
        <div className="brand-row">
          <span>albert</span>
          <span>faz educação</span>
          <span>planneta</span>
          <span>solum</span>
        </div>
      </div>
    </div>
  )
}
