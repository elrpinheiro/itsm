import type { CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { PROJECTS } from '@/data/projects'
import { PROJECT_THEMES } from '@/data/projectThemes'
import type { Project, ProjectBrandId } from '@/types'

/** Ordem das colunas: Planneta à esquerda, Faz ao centro (maior volume de projetos), Educamundi à direita. */
const COLUMN_ORDER: ProjectBrandId[] = ['planneta', 'faz', 'educamundi']

export default function ProjectSelectionScreen() {
  const navigate = useNavigate()
  const selectProject = useProjectStore((s) => s.selectProject)

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
  }

  return (
    <div className="proj-select-wrap">
      <div className="proj-select-title">
        <div style={{ fontWeight: 700, fontSize: 15 }}>Selecione um projeto</div>
        <div style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>
          Escolha a entidade para acessar a Central de Documentos e a Assistência.
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
              <div className="proj-column-list">
                {projects.map((project) => (
                  <button
                    key={project.id}
                    className="proj-row"
                    style={{ '--proj-accent': theme.medio } as CSSProperties}
                    onClick={() => handleSelect(project)}
                    title={project.nome}
                  >
                    <span className="proj-row-avatar">
                      <img src={project.logo} alt={project.nome} />
                    </span>
                    <span className="proj-row-cidade">{project.cidade}</span>
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
