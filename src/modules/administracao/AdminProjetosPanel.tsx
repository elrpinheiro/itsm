import { useState } from 'react'
import { useAllBrandsMap, useAllBrandIds, useAllProjects, useCatalogStore } from '@/store/useCatalogStore'
import AddBrandModal from '@/components/projects/AddBrandModal'
import AddProjectModal from '@/components/projects/AddProjectModal'
import EntidadeDetalheModal from './EntidadeDetalheModal'
import type { Brand, Project } from '@/types'

type BrandModalState = { mode: 'novo' } | { mode: 'editar'; brand: Brand } | null
type ProjectModalState = { mode: 'novo'; brandId: string } | { mode: 'editar'; project: Project } | null

/** Central de cadastro de empresas mantenedoras e das entidades (projetos/unidades) delas — só existe
 * na tela principal de Administração (sem projeto selecionado); dentro de um projeto específico, essa
 * configuração já está decidida e não faz sentido ficar editável ali.
 *
 * Navegação em dois níveis: empresas (blocos fechados) → entidades da empresa selecionada. Clicar numa
 * entidade abre o detalhe (Editar/Inativar + Localizações). Sem exclusão de empresa/entidade — só
 * Inativar, para preservar o histórico (chamados, usuários, ativos) já vinculado a elas. */
export default function AdminProjetosPanel({ canEdit }: { canEdit: boolean }) {
  const brandsMap = useAllBrandsMap()
  const brandIds = useAllBrandIds()
  const projetos = useAllProjects()
  const updateBrand = useCatalogStore((s) => s.updateBrand)

  const [empresaAberta, setEmpresaAberta] = useState<string | null>(null)
  const [brandModal, setBrandModal] = useState<BrandModalState>(null)
  const [projectModal, setProjectModal] = useState<ProjectModalState>(null)
  // Guarda só o id — o objeto é relido de `projetos` a cada render, senão o modal ficaria com uma
  // cópia congelada e não refletiria o toggle de Inativar/Reativar.
  const [entidadeAbertaId, setEntidadeAbertaId] = useState<string | null>(null)
  const entidadeAberta = entidadeAbertaId ? (projetos.find((p) => p.id === entidadeAbertaId) ?? null) : null

  function handleToggleBrand(brand: Brand) {
    updateBrand(brand.id, { status: brand.status === 'Inativo' ? 'Ativo' : 'Inativo' })
  }

  if (empresaAberta) {
    const brand = brandsMap[empresaAberta]
    if (!brand) {
      setEmpresaAberta(null)
      return null
    }
    const entidadesDaEmpresa = projetos.filter((p) => p.brandId === brand.id)

    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: 'var(--texto-sec)', marginBottom: 10 }}>
          <button type="button" className="btn" style={{ padding: '4px 10px', fontSize: 11.5 }} onClick={() => setEmpresaAberta(null)}>
            ← Empresas
          </button>
          <span style={{ color: 'var(--texto-faint)' }}>/</span>
          <span>{brand.nome}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <div>
            <div className="mod-section-title" style={{ marginBottom: 2 }}>
              {brand.nome}
            </div>
            <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>
              {brand.razaoSocial} — clique numa entidade para editar, inativar ou cadastrar suas localizações.
            </div>
          </div>
          {canEdit && (
            <button
              className="btn btn-primary"
              style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
              onClick={() => setProjectModal({ mode: 'novo', brandId: brand.id })}
            >
              + Nova entidade
            </button>
          )}
        </div>

        {entidadesDaEmpresa.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Nenhuma entidade cadastrada ainda para {brand.nome}.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {entidadesDaEmpresa.map((project) => {
              const inativa = project.status === 'Inativo'
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setEntidadeAbertaId(project.id)}
                  style={{
                    textAlign: 'left',
                    border: '1px solid var(--borda)',
                    borderRadius: 10,
                    padding: 12,
                    background: 'var(--card)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    opacity: inativa ? 0.62 : 1,
                    font: 'inherit',
                    color: 'inherit',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={project.logo} alt={project.nome} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--borda)' }} />
                    <span style={{ fontSize: 12.5, fontWeight: 700 }}>{project.nome}</span>
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--texto-sec)' }}>{project.isMatriz ? 'Matriz' : project.cidade}</span>
                  <span>
                    <span className={`badge ${inativa ? '' : 'badge-green'}`} style={inativa ? { background: '#f1efee', color: '#5a4a3f' } : undefined}>
                      {inativa ? 'Inativa' : 'Ativa'}
                    </span>
                  </span>
                  <LocCountBadge projetoId={project.id} />
                </button>
              )
            })}
          </div>
        )}

        {projectModal?.mode === 'novo' && (
          <AddProjectModal defaultBrandId={projectModal.brandId} onClose={() => setProjectModal(null)} />
        )}
        {projectModal?.mode === 'editar' && <AddProjectModal project={projectModal.project} onClose={() => setProjectModal(null)} />}
        {entidadeAberta && (
          <EntidadeDetalheModal
            project={entidadeAberta}
            brand={brand}
            canEdit={canEdit}
            onEditar={() => {
              setProjectModal({ mode: 'editar', project: entidadeAberta })
              setEntidadeAbertaId(null)
            }}
            onClose={() => setEntidadeAbertaId(null)}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mod-section-title" style={{ marginBottom: 4 }}>
        Empresas
      </div>
      <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 16, maxWidth: 640 }}>
        Cada empresa mantenedora do grupo agrupa suas entidades (o que aparece na tela de seleção pós-login).
        Inativar uma empresa a esconde dessa seleção, sem apagar seu histórico — não é possível excluir aqui.
        Clique numa empresa para ver, cadastrar ou editar as entidades dela.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 12 }}>
        {brandIds.map((brandId) => {
          const brand = brandsMap[brandId]
          if (!brand) return null
          const entidadesDaMarca = projetos.filter((p) => p.brandId === brandId)
          const ativas = entidadesDaMarca.filter((p) => (p.status ?? 'Ativo') === 'Ativo').length
          const inativaBrand = brand.status === 'Inativo'
          const metaTxt =
            entidadesDaMarca.length === 0
              ? 'Nenhuma entidade cadastrada'
              : `${ativas} de ${entidadesDaMarca.length} entidade${entidadesDaMarca.length !== 1 ? 's' : ''} ativa${ativas !== 1 ? 's' : ''}`

          return (
            <div
              key={brandId}
              data-brand-card={brandId}
              onClick={() => setEmpresaAberta(brandId)}
              style={{
                border: '1px solid var(--borda)',
                borderRadius: 12,
                background: 'var(--card)',
                padding: 14,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                opacity: inativaBrand ? 0.62 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img src={brand.logo} alt={brand.nome} style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 9, background: '#fff', border: '1px solid var(--borda)', padding: 3 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{brand.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--texto-faint)' }}>{brand.razaoSocial}</div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>{metaTxt}</div>
              <div>
                <span className={`badge ${inativaBrand ? '' : 'badge-green'}`} style={inativaBrand ? { background: '#f1efee', color: '#5a4a3f' } : undefined}>
                  {inativaBrand ? 'Inativa' : 'Ativa'}
                </span>
              </div>
              {canEdit && (
                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
                  <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '4px 9px' }} onClick={() => setBrandModal({ mode: 'editar', brand })}>
                    ✎ Editar
                  </button>
                  <button className="btn" style={{ flex: 1, justifyContent: 'center', fontSize: 11, padding: '4px 9px' }} onClick={() => handleToggleBrand(brand)}>
                    {inativaBrand ? '▶ Reativar' : '⏻ Inativar'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
        {canEdit && (
          <button
            type="button"
            onClick={() => setBrandModal({ mode: 'novo' })}
            style={{
              border: '1.5px dashed var(--borda)',
              borderRadius: 12,
              background: 'none',
              padding: 14,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              minHeight: 128,
              color: 'var(--texto-sec)',
              fontSize: 12.8,
              fontWeight: 600,
              cursor: 'pointer',
              font: 'inherit',
            }}
          >
            <span style={{ fontSize: 22, lineHeight: 1, color: 'var(--texto-faint)' }}>+</span>
            Nova empresa
          </button>
        )}
      </div>

      {brandModal && (
        <AddBrandModal
          brand={brandModal.mode === 'editar' ? brandModal.brand : undefined}
          onClose={() => setBrandModal(null)}
        />
      )}
    </div>
  )
}

/** Contador de localizações cadastradas de uma entidade. */
function LocCountBadge({ projetoId }: { projetoId: string }) {
  const count = useCatalogStore((s) => s.customLocalizacoes[projetoId]?.length ?? 0)
  return <span style={{ fontSize: 10.8, color: 'var(--texto-faint)' }}>📍 {count} localização{count !== 1 ? 'ões' : ''}</span>
}
