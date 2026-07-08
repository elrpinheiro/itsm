import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { PROJECTS } from '@/data/projects'
import { PROJECT_THEMES } from '@/data/projectThemes'
import type { Project, ProjectBrandId } from '@/types'

/** Ordem das colunas: Planneta à esquerda, Faz ao centro (maior volume de projetos), Educamundi à direita. */
const COLUMN_ORDER: ProjectBrandId[] = ['planneta', 'faz', 'educamundi']

export default function ProjectSelectionScreen() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const selectProject = useProjectStore((s) => s.selectProject)

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
  }

  function handleLogout() {
    logout()
    useProjectStore.getState().clearProject()
    navigate('/login', { replace: true })
  }

  return (
    <div className="proj-select-wrap">
      <div className="proj-select-header">
        <div
          style={{
            width: 40,
            height: 40,
            background: 'var(--azul-escuro)',
            color: '#fff',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          V
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 16 }}>Vitae ITSM</div>
          <div style={{ fontSize: 12.5, color: 'var(--texto-sec)' }}>Selecione um projeto para continuar</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right', lineHeight: 1.15 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>{user?.nome}</div>
            <div style={{ fontSize: 10.5, color: 'var(--texto-sec)' }}>{user?.papel}</div>
          </div>
          <span style={{ cursor: 'pointer', fontSize: 16, color: 'var(--texto-sec)' }} title="Sair" onClick={handleLogout}>
            ⏻
          </span>
        </div>
      </div>

      <div className="proj-columns">
        {COLUMN_ORDER.map((brandId) => {
          const theme = PROJECT_THEMES[brandId]
          const projects = PROJECTS.filter((p) => p.brandId === brandId)
          return (
            <div className={`proj-column proj-column-${brandId}`} key={brandId}>
              <div className="proj-column-header" style={{ borderBottomColor: theme.medio }}>
                <img src={theme.logo} alt={theme.label} className="proj-column-logo" />
                <div>
                  <div className="proj-column-title">{theme.label}</div>
                  <div className="proj-column-count">
                    {projects.length} projeto{projects.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="proj-column-grid">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="proj-card"
                    style={{ borderTopColor: theme.medio }}
                    onClick={() => handleSelect(project)}
                  >
                    <div className="proj-card-logo">
                      <img src={project.logo} alt={project.nome} />
                    </div>
                    <div className="proj-card-nome">{project.nome}</div>
                    <div className="proj-card-cidade">{project.cidade}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
