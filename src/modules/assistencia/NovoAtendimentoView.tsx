import { useMemo, useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useAllProjects } from '@/store/useCatalogStore'
import { classificarAtendimento, encontrarChamadosSimilares, reformularDescricao } from '@/data/classificarChamado'
import { PROJECT_CATALOGS, type ClassificationLabel } from '@/data/catalog'
import type { OrigemAtendimento, Prioridade, StatusChamado } from '@/data/chamados'
import UsuarioFormModal from '../administracao/UsuarioFormModal'
import type { Project } from '@/types'

interface Props {
  /** Presente quando aberto de dentro de um projeto específico; ausente na visão global (entidade
   * some da própria seleção do requerente). */
  project?: Project | null
  onClose: () => void
}

const ORIGENS: { key: OrigemAtendimento; icon: string; desc: string }[] = [
  { key: 'Atendente', icon: '🧑‍💻', desc: 'Preenchimento manual' },
  { key: '0800 (URA)', icon: '☎️', desc: 'Transcrição da ligação' },
  { key: 'WhatsApp', icon: '💬', desc: 'Conversa importada' },
]

const STATUS_BUCKET: Record<StatusChamado, 'andamento' | 'pendente' | 'fechado'> = {
  'Na fila': 'andamento',
  'Em atendimento': 'andamento',
  'Aguardando terceiro': 'pendente',
  Fechado: 'fechado',
}

const OUTROS_CATEGORIA = [{ icon: '📋', label: 'Outros' }]
const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica']
const TIPOS: ClassificationLabel[] = ['Requisição', 'Incidente', 'Problema', 'Habilitação de Mudanças']

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

/** Novo atendimento — layout em duas colunas (conversa com o requerente à esquerda, resumo da
 * classificação sugerida pela IA à direita, sempre visível). Página estática e completa (nada
 * aparece/desaparece ao selecionar o requerente): o requerente carrega os dados reais e pode ser
 * editado ali mesmo, a IA sugere categoria/tipo/prioridade/grupo a partir da descrição, e o histórico
 * do requerente aponta tanto recorrência (mesma categoria) quanto chamados com relato parecido (base
 * de consulta). Tela cheia dentro de Assistência, não modal. */
export default function NovoAtendimentoView({ project, onClose }: Props) {
  const usuarios = useAdminStore((s) => s.usuarios)
  const grupos = useAdminStore((s) => s.grupos)
  const atendente = useAuthStore((s) => s.user)
  const chamados = useChamadosStore((s) => s.chamados)
  const addChamado = useChamadosStore((s) => s.addChamado)
  const projetos = useAllProjects()

  const [busca, setBusca] = useState('')
  const [requerenteId, setRequerenteId] = useState<string | null>(null)
  const [editandoRequerente, setEditandoRequerente] = useState(false)
  const [origem, setOrigem] = useState<OrigemAtendimento>('Atendente')
  const [vinculados, setVinculados] = useState<string[]>([])
  const [descricao, setDescricao] = useState('')
  const [acaoRealizada, setAcaoRealizada] = useState('')
  const [solucionado, setSolucionado] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const [categoria, setCategoria] = useState('')
  const [tipoAtendimento, setTipoAtendimento] = useState<ClassificationLabel | ''>('')
  const [prioridade, setPrioridade] = useState<Prioridade | ''>('')
  const [grupoId, setGrupoId] = useState('')

  // Deriva do store (não guarda uma cópia) para refletir na hora qualquer edição feita em "Atualizar Informações do Usuário".
  const requerente = useMemo(() => usuarios.find((u) => u.id === requerenteId) ?? null, [usuarios, requerenteId])

  const effectiveProject = project ?? (requerente?.projetoId ? projetos.find((p) => p.id === requerente.projetoId) ?? null : null)
  const projetoLabel = effectiveProject ? `${effectiveProject.nome} — ${effectiveProject.cidade}` : 'Matriz'
  const catalogBruto = effectiveProject ? PROJECT_CATALOGS[effectiveProject.id] : undefined
  const catalog = catalogBruto && catalogBruto.length ? catalogBruto : OUTROS_CATEGORIA

  const candidatos = useMemo(() => {
    if (!busca.trim()) return []
    const q = busca.trim().toLowerCase()
    return usuarios.filter((u) => u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.login.toLowerCase().includes(q)).slice(0, 6)
  }, [busca, usuarios])

  const historico = useMemo(
    () => (requerente ? chamados.filter((c) => c.solicitanteEmail === requerente.email) : []),
    [chamados, requerente],
  )
  const nAndamento = historico.filter((c) => STATUS_BUCKET[c.status] === 'andamento').length
  const nPendente = historico.filter((c) => STATUS_BUCKET[c.status] === 'pendente').length
  const nFechado = historico.filter((c) => STATUS_BUCKET[c.status] === 'fechado').length

  const recorrencia = useMemo(() => {
    if (!categoria) return null
    const mesmos = historico.filter((c) => c.categoria === categoria)
    if (mesmos.length < 2) return null
    return { total: mesmos.length + 1, categoria }
  }, [historico, categoria])

  // Camada de IA sobre o histórico: aponta chamados anteriores com relato parecido (mesmo sem ser a
  // mesma categoria), para servirem de base de consulta — o atendente vê ali mesmo como foi resolvido antes.
  const similares = useMemo(() => encontrarChamadosSimilares(descricao, historico), [descricao, historico])

  function toggleVinculo(numero: string) {
    setVinculados((prev) => (prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]))
  }

  function aplicarIA(textoBase: string) {
    const limpo = reformularDescricao(textoBase)
    setDescricao(limpo)
    const sugestao = classificarAtendimento(limpo, catalogBruto)
    setCategoria(sugestao.categoria)
    setTipoAtendimento(sugestao.tipoAtendimento)
    setPrioridade(sugestao.prioridade)
    setGrupoId(sugestao.grupoId)
  }

  function handleDescricaoChange(v: string) {
    setDescricao(v)
    if (v.trim().length > 8) {
      const sugestao = classificarAtendimento(v, catalogBruto)
      setCategoria(sugestao.categoria)
      setTipoAtendimento(sugestao.tipoAtendimento)
      setPrioridade(sugestao.prioridade)
      setGrupoId(sugestao.grupoId)
    }
  }

  function handleSubmit() {
    if (!requerente) return setError('Selecione o requerente.')
    if (!descricao.trim()) return setError('Descreva o atendimento.')
    if (solucionado === null) return setError('Informe se o chamado já foi solucionado.')
    if (solucionado && !acaoRealizada.trim()) return setError('Descreva a ação realizada para encerrar o chamado.')

    addChamado({
      projetoNome: projetoLabel,
      assunto: descricao,
      prioridade: prioridade || 'Média',
      descricao,
      solicitanteEmail: requerente.email,
      categoria: categoria || 'Outros',
      tipoAtendimento: tipoAtendimento || 'Requisição',
      grupoId: grupoId || 'grp-n1',
      origem,
      vinculados,
      resolvidoNaHora: solucionado,
      acaoRealizada: solucionado ? acaoRealizada : undefined,
    })
    onClose()
  }

  return (
    <div className="mod-scroll-area">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <button type="button" className="btn" onClick={onClose}>
          ← Voltar
        </button>
        <div className="mod-section-title" style={{ marginBottom: 0 }}>
          Novo atendimento{requerente ? ` — ${effectiveProject ? effectiveProject.nome : 'Matriz'}` : project ? ` — ${project.nome}` : ''}
        </div>
        {atendente && (
          <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--texto-sec)' }}>
            {atendente.nome} · Assistência
          </div>
        )}
      </div>

      <div className="nc-split">
        <div className="nc-left">
          <div className="frow">
            <label className="field-label">Requerente</label>
            {!requerente && (
              <div className="nc-req-search">
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Busque por nome, login ou e-mail…"
                />
                {candidatos.length > 0 && (
                  <div className="nc-req-results">
                    {candidatos.map((u) => (
                      <div
                        key={u.id}
                        className="nc-req-result"
                        onClick={() => {
                          setRequerenteId(u.id)
                          setBusca('')
                        }}
                      >
                        <b>{u.nome}</b>
                        <div className="sub">{u.email}{u.cargo ? ` · ${u.cargo}` : ''}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {requerente && (
              <div className="nc-req-chip-block">
                <div className="nc-req-chip-row">
                  <span className="nc-req-avatar">{iniciais(requerente.nome)}</span>
                  <span className="nc-req-chip">{requerente.nome}</span>
                  <button type="button" className="nc-req-chip-x" onClick={() => setRequerenteId(null)} title="Trocar requerente">
                    ×
                  </button>
                </div>
                <div className="nc-req-compact">
                  <span>{requerente.email}</span>
                  <span>·</span>
                  <span>{requerente.cargo ?? requerente.categoria ?? '—'}</span>
                  <span>·</span>
                  <span>{requerente.celular ?? requerente.telefone ?? '—'}</span>
                  <span>·</span>
                  <span>{projetoLabel}</span>
                  <button type="button" className="nc-req-link" onClick={() => setEditandoRequerente(true)}>
                    ✎ Atualizar Informações do Usuário
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="frow">
            <label className="field-label">Origem do atendimento</label>
            <div className="nc-origin-row">
              {ORIGENS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className={`nc-origin-opt${origem === o.key ? ' on' : ''}`}
                  onClick={() => setOrigem(o.key)}
                >
                  <div className="t">
                    <span>{o.icon}</span>
                    {o.key}
                  </div>
                  <div className="d">{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="frow">
            <label className="field-label">Descrição do atendimento</label>
            <div className="nc-chat">
              {descricao.trim() && (
                <div className="nc-chat-bubble in">
                  <div className="nc-chat-meta">Requerente · {origem}</div>
                  <div>{descricao}</div>
                </div>
              )}
              {categoria && (
                <div className="nc-chat-bubble note">
                  <div className="nc-chat-meta">Atendente</div>
                  <div>Classificação sugerida e histórico do requerente cruzado automaticamente.</div>
                </div>
              )}
              <div className="nc-composer">
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => handleDescricaoChange(e.target.value)}
                  placeholder="Continue a conversa ou cole a transcrição do atendimento…"
                />
                <button type="button" className="nc-composer-send" onClick={() => aplicarIA(descricao)} title="Reformular com IA">
                  ✦
                </button>
              </div>
              <button type="button" className="btn" style={{ alignSelf: 'flex-start' }} onClick={() => setDescricao('')}>
                Limpar
              </button>
            </div>
          </div>

          <div className="frow">
            <div className="nc-status-bar">
              <div className="nc-status-chip"><b>{nAndamento}</b> Em andamento</div>
              <div className="nc-status-chip"><b>{nPendente}</b> Pendente</div>
              <div className="nc-status-chip"><b>{nFechado}</b> Fechado</div>
            </div>
          </div>

          <div className="frow">
            <label className="field-label">Histórico do requerente (marque para vincular)</label>
            <div style={{ border: '1px solid var(--borda)', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
              {historico.length === 0 && (
                <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--texto-sec)' }}>
                  {requerente ? 'Nenhum chamado anterior deste requerente.' : 'Selecione um requerente para ver o histórico.'}
                </div>
              )}
              {historico.map((c) => {
                const match = similares.has(c.numero)
                return (
                  <div key={c.numero} className={`nc-hist-item${match ? ' match' : ''}`}>
                    <label className="nc-hist-row">
                      <input type="checkbox" checked={vinculados.includes(c.numero)} onChange={() => toggleVinculo(c.numero)} />
                      <span className="nc-hist-num">{c.numero}</span>
                      <span className="nc-hist-title">{c.assunto}</span>
                      {match && <span className="nc-hist-ia-badge">✦ IA: relato parecido</span>}
                      <span className="badge">{c.status}</span>
                    </label>
                    {match && c.acaoRealizada && (
                      <div className="nc-hist-ia-note">Base de consulta — resolvido antes com: "{c.acaoRealizada}"</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {recorrencia && (
            <div className="nc-insight">
              <span>⚠️</span>
              <span>
                <b>{recorrencia.total}º chamado de "{recorrencia.categoria}"</b> deste requerente — padrão recorrente,
                pode indicar causa raiz. Considere abrir uma avaliação além do reparo.
              </span>
            </div>
          )}

          <div className="frow">
            <label className="field-label">Chamado solucionado?</label>
            <div className="nc-decision">
              <div className={`opt yes${solucionado === true ? ' chosen' : ''}`} onClick={() => setSolucionado(true)}>
                <div className="t">✓ Sim</div>
                <div className="d">Chamado será finalizado com a ação abaixo como solução.</div>
              </div>
              <div className={`opt no${solucionado === false ? ' chosen' : ''}`} onClick={() => setSolucionado(false)}>
                <div className="t">✕ Não</div>
                <div className="d">Chamado fica aberto, encaminhado ao grupo sugerido.</div>
              </div>
            </div>
          </div>

          {solucionado && (
            <div className="frow">
              <label className="field-label">Ação realizada</label>
              <textarea rows={2} value={acaoRealizada} onChange={(e) => setAcaoRealizada(e.target.value)} placeholder="O que foi feito para resolver?" />
            </div>
          )}

          {error && <div className="admin-error">{error}</div>}
          <div className="admin-form-actions">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!requerente}>
              Criar chamado
            </button>
          </div>
        </div>

        <div className="nc-right">
          <div className="nc-summary-head">
            <div className="t">Resumo do chamado</div>
            <div className="d">atualizado automaticamente pela sugestão de IA</div>
          </div>

          <div className="nc-summary-card">
            <span className={`nc-summary-ic${categoria ? ' on' : ''}`}>{categoria ? '✓' : '•'}</span>
            <div className="nc-summary-body">
              <div className="lbl">Categoria</div>
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                <option value="">Selecione…</option>
                {catalog.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.icon} {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="nc-summary-card">
            <span className={`nc-summary-ic${tipoAtendimento ? ' on' : ''}`}>{tipoAtendimento ? '✓' : '•'}</span>
            <div className="nc-summary-body">
              <div className="lbl">Tipo de atendimento</div>
              <select value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value as ClassificationLabel)}>
                <option value="">Selecione…</option>
                {TIPOS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="nc-summary-card">
            <span className={`nc-summary-ic${prioridade ? ' on' : ''}`}>{prioridade ? '✓' : '•'}</span>
            <div className="nc-summary-body">
              <div className="lbl">Prioridade</div>
              <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
                <option value="">Selecione…</option>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="nc-summary-card">
            <span className={`nc-summary-ic${grupoId ? ' on' : ''}`}>{grupoId ? '✓' : '•'}</span>
            <div className="nc-summary-body">
              <div className="lbl">Grupo de atendimento</div>
              <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                <option value="">Selecione…</option>
                {grupos.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {editandoRequerente && requerente && <UsuarioFormModal usuario={requerente} onClose={() => setEditandoRequerente(false)} />}
    </div>
  )
}
