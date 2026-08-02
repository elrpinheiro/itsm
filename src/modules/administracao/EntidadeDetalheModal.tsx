import { useState } from 'react'
import Modal from '@/components/common/Modal'
import { useCatalogStore, useLocalizacoesEntidade } from '@/store/useCatalogStore'
import type { Brand, Project } from '@/types'

interface Props {
  project: Project
  brand: Brand
  canEdit: boolean
  onEditar: () => void
  onClose: () => void
}

/** Modal de detalhe de uma entidade (clicada a partir da grade de entidades da empresa) — reúne
 * Editar/Inativar a própria entidade e a gestão das Localizações reais dela, que alimentam o campo
 * Localização de Novo Atendimento e o picker de projeto pós-login. Sem exclusão da entidade aqui —
 * só Inativar, para preservar chamados/usuários já vinculados; Localização pode ser excluída porque é
 * só um valor de lista, sem histórico amarrado. */
export default function EntidadeDetalheModal({ project, brand, canEdit, onEditar, onClose }: Props) {
  const localizacoes = useLocalizacoesEntidade(project.id)
  const updateProject = useCatalogStore((s) => s.updateProject)
  const addLocalizacao = useCatalogStore((s) => s.addLocalizacao)
  const renameLocalizacao = useCatalogStore((s) => s.renameLocalizacao)
  const toggleLocalizacaoStatus = useCatalogStore((s) => s.toggleLocalizacaoStatus)
  const removeLocalizacao = useCatalogStore((s) => s.removeLocalizacao)

  const [novaLoc, setNovaLoc] = useState('')
  const [renomeandoId, setRenomeandoId] = useState<string | null>(null)
  const [renomeioValor, setRenomeioValor] = useState('')

  const inativa = project.status === 'Inativo'

  function handleToggleEntidade() {
    updateProject(project.id, { status: inativa ? 'Ativo' : 'Inativo' })
  }

  function handleAdicionarLoc() {
    if (!novaLoc.trim()) return
    addLocalizacao(project.id, novaLoc)
    setNovaLoc('')
  }

  function handleExcluirLoc(id: string, nome: string) {
    if (!window.confirm(`Excluir a localização "${nome}"?`)) return
    removeLocalizacao(project.id, id)
  }

  function startRenomear(id: string, nomeAtual: string) {
    setRenomeandoId(id)
    setRenomeioValor(nomeAtual)
  }

  function commitRenomear(id: string) {
    renameLocalizacao(project.id, id, renomeioValor)
    setRenomeandoId(null)
  }

  return (
    <Modal
      title={
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={brand.logo} alt={brand.nome} style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'contain', background: '#fff', border: '1px solid var(--borda)', padding: 2 }} />
          <span>
            <div>{project.nome}</div>
            <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--texto-sec)' }}>{project.cidade} · {brand.nome}</div>
          </span>
        </span>
      }
      onClose={onClose}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <span className={`badge ${inativa ? '' : 'badge-green'}`} style={inativa ? { background: '#f1efee', color: '#5a4a3f' } : undefined}>
            {inativa ? 'Entidade inativa' : 'Entidade ativa'}
          </span>
        </div>

        {canEdit && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onEditar}>
              ✎ Editar entidade
            </button>
            <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={handleToggleEntidade}>
              {inativa ? '▶ Reativar' : '⏻ Inativar'} entidade
            </button>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--borda)', paddingTop: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--texto-sec)', marginBottom: 8 }}>
            📍 Localizações desta entidade
          </div>
          <div style={{ background: 'var(--azul-pale)', border: '1px solid var(--azul)', borderRadius: 9, padding: '10px 12px', fontSize: 11.8, color: 'var(--azul-texto)', lineHeight: 1.5, marginBottom: 10 }}>
            Uma localização cadastrada aqui aparece automaticamente no campo <strong>Localização</strong> de Novo
            Atendimento (Assistência) e na tela de seleção de projeto — mesma fonte de dados nos dois lugares.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
            {localizacoes.map((loc) => {
              const locInativa = loc.status === 'Inativo'
              return (
                <div
                  key={loc.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--fundo)',
                    border: '1px solid var(--borda)',
                    borderRadius: 8,
                    padding: '7px 10px',
                    opacity: locInativa ? 0.62 : 1,
                  }}
                >
                  {renomeandoId === loc.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={renomeioValor}
                      onChange={(e) => setRenomeioValor(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') commitRenomear(loc.id)
                        if (e.key === 'Escape') setRenomeandoId(null)
                      }}
                      style={{ flex: 1, fontSize: 12.5, padding: '4px 7px' }}
                    />
                  ) : (
                    <span style={{ flex: 1, fontSize: 12.5, fontWeight: 600 }}>{loc.nome}</span>
                  )}
                  {locInativa && !renomeandoId && <span className="badge" style={{ background: '#f1efee', color: '#5a4a3f', fontSize: 10 }}>Inativa</span>}
                  {canEdit && (
                    <span style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      {renomeandoId === loc.id ? (
                        <button type="button" className="btn" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => commitRenomear(loc.id)} title="Salvar">
                          ✓
                        </button>
                      ) : (
                        <button type="button" className="btn" style={{ fontSize: 11, padding: '3px 8px' }} onClick={() => startRenomear(loc.id, loc.nome)} title="Editar">
                          ✎
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn"
                        style={{ fontSize: 11, padding: '3px 8px' }}
                        onClick={() => toggleLocalizacaoStatus(project.id, loc.id)}
                        title={locInativa ? 'Reativar' : 'Inativar'}
                      >
                        {locInativa ? '▶' : '⏻'}
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ fontSize: 11, padding: '3px 8px', color: 'var(--vermelho-texto)' }}
                        onClick={() => handleExcluirLoc(loc.id, loc.nome)}
                        title="Excluir"
                      >
                        🗑
                      </button>
                    </span>
                  )}
                </div>
              )
            })}
            {localizacoes.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--texto-sec)', padding: '4px 2px' }}>
                Nenhuma localização cadastrada — o campo Localização de Novo Atendimento usa a lista de teste genérica até cadastrar a primeira aqui.
              </div>
            )}
          </div>

          {canEdit && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="text"
                value={novaLoc}
                onChange={(e) => setNovaLoc(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAdicionarLoc()
                  }
                }}
                placeholder="Ex.: Sala de Informática"
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 12.5 }} onClick={handleAdicionarLoc}>
                + Adicionar
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
