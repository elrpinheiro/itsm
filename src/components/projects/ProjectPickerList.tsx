import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllProjects, useProjectTheme } from '@/store/useCatalogStore'
import type { Project, ProjectBrandId } from '@/types'

function ProjectRow({ project, onSelect, label }: { project: Project; onSelect: (p: Project) => void; label?: string }) {
  return (
    <button className="proj-row" onClick={() => onSelect(project)} title={project.nome}>
      <span className="proj-row-avatar">
        <span className="proj-row-avatar-inner">
          <span className="proj-row-avatar-clip">
            <img src={project.logo} alt={project.nome} />
          </span>
        </span>
      </span>
      <span className="proj-row-cidade">{label ?? project.cidade}</span>
    </button>
  )
}

function BrandGroup({ brandId, onSelect }: { brandId: ProjectBrandId; onSelect: (p: Project) => void }) {
  const theme = useProjectTheme(brandId)
  const allProjects = useAllProjects()
  const projects = allProjects.filter((p) => p.brandId === brandId && !p.isMatriz)
  const [recolhido, setRecolhido] = useState(false)

  return (
    <div className={`proj-column${recolhido ? ' collapsed' : ''}`}>
      <div className="proj-column-header" onClick={() => setRecolhido((r) => !r)} title={recolhido ? 'Clique para mostrar os projetos' : 'Clique para recolher os projetos'}>
        <img src={theme.logo} alt={theme.label} className="proj-column-logo" />
        <div>
          <div className="proj-column-title">{theme.label}</div>
          <div className="proj-column-count">
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
          </div>
        </div>
        <span className="proj-column-toggle">{recolhido ? '▸' : '▾'}</span>
      </div>
      {!recolhido && (
        <div className="proj-column-list">
          {projects.map((project) => (
            <ProjectRow key={project.id} project={project} onSelect={onSelect} />
          ))}
          {projects.length === 0 && <div className="proj-column-empty">Nenhum projeto cadastrado ainda.</div>}
        </div>
      )}
    </div>
  )
}

/** Lista de projetos agrupada por marca, usada dentro do dropdown "Selecione o Projeto" do cabeçalho. */
export default function ProjectPickerList({ onSelect }: { onSelect?: () => void }) {
  const navigate = useNavigate()
  const selectProject = useProjectStore((s) => s.selectProject)
  const allProjects = useAllProjects()
  const matrizes = allProjects.filter((p) => p.isMatriz)
  const fieldBrandIds = Array.from(new Set(allProjects.filter((p) => !p.isMatriz).map((p) => p.brandId)))

  function handleSelect(project: Project) {
    selectProject(project)
    navigate('/app')
    onSelect?.()
  }

  return (
    <div className="proj-picker-list">
      {matrizes.length > 0 && (
        <div className="proj-section">
          <div className="proj-section-title">Matriz</div>
          <div className="proj-picker-matriz">
            {matrizes.map((project) => (
              <ProjectRow key={project.id} project={project} onSelect={handleSelect} label={project.nome} />
            ))}
          </div>
        </div>
      )}
      <div className="proj-section">
        <div className="proj-section-title">Projetos</div>
        <div className="proj-picker-groups">
          {fieldBrandIds.map((brandId) => (
            <BrandGroup key={brandId} brandId={brandId} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </div>
  )
}
