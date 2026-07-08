import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { PROJECTS } from '@/data/projects'
import { PROJECT_THEMES } from '@/data/projectThemes'
import { PROJECT_ALERTS, getAlertDescription, getAlertLevel, getAlertTotal } from '@/data/projectAlerts'
import type { Project, ProjectBrandId } from '@/types'

/** Coluna da esquerda empilha Planneta e Faz (mesma largura); Educamundi fica isolada à direita — libera espaço horizontal para os painéis de operação. */
const LEFT_STACK: ProjectBrandId[] = ['planneta', 'faz']
const RIGHT_STACK: ProjectBrandId[] = ['educamundi']

function ProjectColumn({ brandId }: { brandId: ProjectBrandId }) {
  const navigate = useNavigate()
  const selectProject = useProjectStore((s) => s.selectProject)
  const theme = PROJECT_THEMES[brandId]
  const projects = PROJECTS.filter((p) => p.brandId === brandId)

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
  }

  return (
    <div className={`proj-column proj-column-${brandId}`}>
      <div className="proj-column-header" style={{ borderBottomColor: theme.medio }}>
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
      </div>
    </div>
  )
}

export default function ProjectSelectionScreen() {
  return (
    <div className="proj-select-wrap">
      <div className="proj-select-title">
        <div style={{ fontWeight: 700, fontSize: 15 }}>Selecione um projeto</div>
        <div style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>
          Escolha a entidade para acessar a Central de Documentos e a Assistência.
        </div>
      </div>

      <div className="proj-columns">
        <div className="proj-col-stack">
          {LEFT_STACK.map((brandId) => (
            <ProjectColumn brandId={brandId} key={brandId} />
          ))}
        </div>
        <div className="proj-col-stack">
          {RIGHT_STACK.map((brandId) => (
            <ProjectColumn brandId={brandId} key={brandId} />
          ))}
        </div>
      </div>
    </div>
  )
}
