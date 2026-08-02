import { useState } from 'react'
import { useAllBrandsMap, useAllBrandIds, useAllProjects, useCatalogStore } from '@/store/useCatalogStore'
import AddBrandModal from '@/components/projects/AddBrandModal'
import AddProjectModal from '@/components/projects/AddProjectModal'
import LocalizacoesModal from '@/components/projects/LocalizacoesModal'
import type { Brand, Project } from '@/types'

type BrandModalState = { mode: 'novo' } | { mode: 'editar'; brand: Brand } | null
type ProjectModalState = { mode: 'novo' } | { mode: 'editar'; project: Project } | null

/** Central de cadastro de empresas mantenedoras e projetos/unidades — só existe na tela principal
 * de Administração (sem projeto selecionado); dentro de um projeto específico, essa configuração
 * já está decidida e não faz sentido ficar editável ali. */
export default function AdminProjetosPanel({ canEdit }: { canEdit: boolean }) {
  const brandsMap = useAllBrandsMap()
  const brandIds = useAllBrandIds()
  const projetos = useAllProjects()
  const deleteBrand = useCatalogStore((s) => s.deleteBrand)
  const deleteProject = useCatalogStore((s) => s.deleteProject)

  const [brandModal, setBrandModal] = useState<BrandModalState>(null)
  const [projectModal, setProjectModal] = useState<ProjectModalState>(null)
  const [localizacoesProject, setLocalizacoesProject] = useState<Project | null>(null)

  function handleExcluirBrand(brand: Brand) {
    if (!window.confirm(`Excluir a empresa "${brand.nome}"? Esta ação não pode ser desfeita.`)) return
    const result = deleteBrand(brand.id)
    if (!result.ok) alert(result.error)
  }

  function handleExcluirProject(project: Project) {
    if (
      !window.confirm(
        `Excluir o projeto "${project.nome} — ${project.cidade}"? Chamados, usuários e outros cadastros já vinculados a esta unidade continuam existindo, mas ela some da seleção de projetos e dos filtros. Esta ação não pode ser desfeita.`,
      )
    )
      return
    deleteProject(project.id)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
        <div className="mod-section-title" style={{ marginBottom: 0 }}>
          Empresas e Projetos
        </div>
        {canEdit && (
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button className="btn" style={{ padding: '7px 14px', fontSize: 12.5 }} onClick={() => setBrandModal({ mode: 'novo' })}>
              + Nova empresa
            </button>
            <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 12.5 }} onClick={() => setProjectModal({ mode: 'novo' })}>
              + Novo projeto
            </button>
          </div>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 16, maxWidth: 640 }}>
        Cada empresa mantenedora agrupa seus projetos/unidades (o que aparece na tela de seleção pós-login).
        Editar ou excluir aqui vale para o sistema todo — o filtro de entidade das outras abas usa exatamente
        esta lista. Dentro de cada projeto, é possível cadastrar as <strong>Localizações</strong> reais da
        unidade, usadas no campo Localização de Novo Atendimento.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {brandIds.map((brandId) => {
          const brand = brandsMap[brandId]
          if (!brand) return null
          const projetosDaMarca = projetos.filter((p) => p.brandId === brandId)
          return (
            <div key={brandId} data-brand-card={brandId} style={{ border: '1px solid var(--borda)', borderRadius: 12, background: 'var(--card)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--fundo)', borderBottom: '1px solid var(--borda)' }}>
                <img src={brand.logo} alt={brand.nome} style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 8, background: '#fff', border: '1px solid var(--borda)', padding: 3 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{brand.nome}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>
                    {brand.razaoSocial} · {projetosDaMarca.length} projeto{projetosDaMarca.length !== 1 ? 's' : ''}
                  </div>
                </div>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn" style={{ fontSize: 11, padding: '4px 9px' }} onClick={() => setBrandModal({ mode: 'editar', brand })}>
                      Editar
                    </button>
                    <button
                      className="btn"
                      style={{ fontSize: 11, padding: '4px 9px', color: 'var(--vermelho-texto)' }}
                      onClick={() => handleExcluirBrand(brand)}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
              <div style={{ padding: 14 }}>
                {projetosDaMarca.length === 0 ? (
                  <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Nenhum projeto cadastrado ainda.</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                    {projetosDaMarca.map((project) => (
                      <div
                        key={project.id}
                        data-project-card={project.id}
                        style={{ border: '1px solid var(--borda)', borderRadius: 10, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <img src={project.logo} alt={project.nome} style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--borda)' }} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{project.nome}</div>
                            <div style={{ fontSize: 11, color: 'var(--texto-sec)' }}>{project.isMatriz ? 'Matriz' : project.cidade}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button className="btn" style={{ fontSize: 10.5, padding: '3px 7px' }} onClick={() => setLocalizacoesProject(project)}>
                            📍 Localizações
                          </button>
                          {canEdit && (
                            <>
                              <button className="btn" style={{ fontSize: 10.5, padding: '3px 7px' }} onClick={() => setProjectModal({ mode: 'editar', project })}>
                                Editar
                              </button>
                              <button
                                className="btn"
                                style={{ fontSize: 10.5, padding: '3px 7px', color: 'var(--vermelho-texto)' }}
                                onClick={() => handleExcluirProject(project)}
                              >
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {brandModal && (
        <AddBrandModal
          brand={brandModal.mode === 'editar' ? brandModal.brand : undefined}
          onClose={() => setBrandModal(null)}
        />
      )}
      {projectModal && (
        <AddProjectModal
          project={projectModal.mode === 'editar' ? projectModal.project : undefined}
          onClose={() => setProjectModal(null)}
        />
      )}
      {localizacoesProject && <LocalizacoesModal project={localizacoesProject} onClose={() => setLocalizacoesProject(null)} />}
    </div>
  )
}
