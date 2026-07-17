import { useMemo, useState } from 'react'
import { useAdminStore } from '@/store/useAdminStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useAllProjects } from '@/store/useCatalogStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { classificarAtendimento, encontrarChamadosSimilares, reformularDescricao } from '@/data/classificarChamado'
import { PROJECT_CATALOGS, type ClassificationLabel } from '@/data/catalog'
import type { OrigemAtendimento, Prioridade, StatusChamado } from '@/data/chamados'
import { ATIVOS_VINCULAVEIS } from '@/data/ativosMock'
import { buscarConversaWhatsApp, buscarGravacaoURA, type GravacaoURA } from '@/data/integracaoOrigem'
import { buscarSolucaoSugerida } from '@/data/baseConhecimento'
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
  'Processando (planejado)': 'andamento',
  'Aguardando terceiro': 'pendente',
  Solucionado: 'andamento',
  Fechado: 'fechado',
}

const OUTROS_CATEGORIA = [{ icon: '📋', label: 'Outros' }]
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
  const prioridadeEntries = useDropdownEntries('prioridade').filter((e) => e.ativo)
  const origemLabels = Object.fromEntries(useDropdownEntries('origem').map((e) => [e.chave, e.label]))

  const [busca, setBusca] = useState('')
  const [requerenteId, setRequerenteId] = useState<string | null>(null)
  const [editandoRequerente, setEditandoRequerente] = useState(false)
  const [origem, setOrigem] = useState<OrigemAtendimento>('Atendente')
  const [linkedId, setLinkedId] = useState('')
  const [gravacao, setGravacao] = useState<GravacaoURA | null>(null)
  const [protocoloWhatsapp, setProtocoloWhatsapp] = useState('')
  const [conversaImportada, setConversaImportada] = useState(false)
  const [buscaAtivo, setBuscaAtivo] = useState('')
  const [ativosVinculados, setAtivosVinculados] = useState<string[]>([])
  const [vinculados, setVinculados] = useState<string[]>([])
  const [filtroHistorico, setFiltroHistorico] = useState<'andamento' | 'pendente' | 'fechado' | null>(null)
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

  // A barra de status filtra a lista abaixo (clique de novo no mesmo chip, ou em "Ocultar filtro", volta a mostrar tudo).
  const historicoExibido = useMemo(
    () => (filtroHistorico ? historico.filter((c) => STATUS_BUCKET[c.status] === filtroHistorico) : historico),
    [historico, filtroHistorico],
  )

  function toggleFiltroHistorico(bucket: 'andamento' | 'pendente' | 'fechado') {
    setFiltroHistorico((atual) => (atual === bucket ? null : bucket))
  }

  const recorrencia = useMemo(() => {
    if (!categoria) return null
    const mesmos = historico.filter((c) => c.categoria === categoria)
    if (mesmos.length < 2) return null
    return { total: mesmos.length + 1, categoria }
  }, [historico, categoria])

  // Camada de IA sobre o histórico: aponta chamados anteriores com relato parecido (mesmo sem ser a
  // mesma categoria), para servirem de base de consulta — o atendente vê ali mesmo como foi resolvido antes.
  const similares = useMemo(() => encontrarChamadosSimilares(descricao, historico), [descricao, historico])

  // Ao marcar "Chamado solucionado? Sim", sugere uma solução aplicável a partir da Base de Conhecimento
  // (por categoria + palavra-chave da descrição) para o atendente aplicar, editar ou reformular com IA.
  const solucaoSugerida = useMemo(
    () => (solucionado && categoria ? buscarSolucaoSugerida(categoria, descricao) : null),
    [solucionado, categoria, descricao],
  )

  const candidatosAtivos = useMemo(() => {
    if (!buscaAtivo.trim()) return []
    const q = buscaAtivo.trim().toLowerCase()
    return ATIVOS_VINCULAVEIS.filter(
      (a) =>
        !ativosVinculados.includes(a.patrimonio) &&
        (a.patrimonio.toLowerCase().includes(q) || a.label.toLowerCase().includes(q) || a.tipo.toLowerCase().includes(q)),
    ).slice(0, 6)
  }, [buscaAtivo, ativosVinculados])

  function toggleVinculo(numero: string) {
    setVinculados((prev) => (prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]))
  }

  function toggleAtivoVinculado(patrimonio: string) {
    setAtivosVinculados((prev) => (prev.includes(patrimonio) ? prev.filter((p) => p !== patrimonio) : [...prev, patrimonio]))
  }

  function handleOrigemChange(nova: OrigemAtendimento) {
    setOrigem(nova)
    setLinkedId('')
    setGravacao(null)
    setProtocoloWhatsapp('')
    setConversaImportada(false)
  }

  function handleBuscarGravacao() {
    setGravacao(buscarGravacaoURA(linkedId))
  }

  function handleImportarConversa() {
    const transcricao = buscarConversaWhatsApp(protocoloWhatsapp)
    if (!transcricao) return
    setConversaImportada(true)
    aplicarIA(transcricao)
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
      linkedId: origem === '0800 (URA)' ? linkedId.trim() || undefined : undefined,
      gravacaoUrl: origem === '0800 (URA)' ? gravacao?.url : undefined,
      protocoloWhatsapp: origem === 'WhatsApp' ? protocoloWhatsapp.trim() || undefined : undefined,
      ativosVinculados,
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
                  onClick={() => handleOrigemChange(o.key)}
                >
                  <div className="t">
                    <span>{o.icon}</span>
                    {origemLabels[o.key] ?? o.key}
                  </div>
                  <div className="d">{o.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {origem === '0800 (URA)' && (
            <div className="frow">
              <label className="field-label">Linkedid da ligação</label>
              <div className="nc-lookup-row">
                <input
                  type="text"
                  value={linkedId}
                  onChange={(e) => setLinkedId(e.target.value)}
                  placeholder="Ex.: 1783694943.75408"
                />
                <button type="button" className="btn" onClick={handleBuscarGravacao} disabled={!linkedId.trim()}>
                  🎧 Buscar gravação
                </button>
              </div>
              {gravacao && (
                <div className="nc-lookup-result">
                  ✓ Gravação localizada ({gravacao.duracao}) — anexada ao acompanhamento do chamado.
                </div>
              )}
            </div>
          )}

          {origem === 'WhatsApp' && (
            <div className="frow">
              <label className="field-label">Protocolo da conversa</label>
              <div className="nc-lookup-row">
                <input
                  type="text"
                  value={protocoloWhatsapp}
                  onChange={(e) => setProtocoloWhatsapp(e.target.value)}
                  placeholder="Ex.: 2562-2143753539687"
                />
                <button type="button" className="btn" onClick={handleImportarConversa} disabled={!protocoloWhatsapp.trim()}>
                  💬 Importar conversa
                </button>
              </div>
              {conversaImportada && (
                <div className="nc-lookup-result">✓ Conversa importada para a descrição abaixo, com classificação sugerida pela IA.</div>
              )}
            </div>
          )}

          <div className="frow">
            <label className="field-label">
              Vincular Itens <span className="field-label-hint">(patrimônios de Ativos)</span>
            </label>
            <div className="nc-req-search">
              <input
                type="text"
                value={buscaAtivo}
                onChange={(e) => setBuscaAtivo(e.target.value)}
                placeholder="Busque por patrimônio ou modelo…"
              />
              {candidatosAtivos.length > 0 && (
                <div className="nc-req-results">
                  {candidatosAtivos.map((a) => (
                    <div
                      key={a.patrimonio}
                      className="nc-req-result"
                      onClick={() => {
                        toggleAtivoVinculado(a.patrimonio)
                        setBuscaAtivo('')
                      }}
                    >
                      <b>{a.patrimonio}</b>
                      <div className="sub">{a.label} · {a.tipo}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {ativosVinculados.length > 0 && (
              <div className="nc-chip-row">
                {ativosVinculados.map((patrimonio) => {
                  const ativo = ATIVOS_VINCULAVEIS.find((a) => a.patrimonio === patrimonio)
                  return (
                    <span key={patrimonio} className="nc-item-chip">
                      {patrimonio}
                      {ativo ? ` — ${ativo.label}` : ''}
                      <button type="button" onClick={() => toggleAtivoVinculado(patrimonio)}>
                        ×
                      </button>
                    </span>
                  )
                })}
              </div>
            )}
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
              <button
                type="button"
                className={`nc-status-chip${filtroHistorico === 'andamento' ? ' on' : ''}`}
                onClick={() => toggleFiltroHistorico('andamento')}
              >
                <b>{nAndamento}</b> Em andamento
              </button>
              <button
                type="button"
                className={`nc-status-chip${filtroHistorico === 'pendente' ? ' on' : ''}`}
                onClick={() => toggleFiltroHistorico('pendente')}
              >
                <b>{nPendente}</b> Pendente
              </button>
              <button
                type="button"
                className={`nc-status-chip${filtroHistorico === 'fechado' ? ' on' : ''}`}
                onClick={() => toggleFiltroHistorico('fechado')}
              >
                <b>{nFechado}</b> Fechado
              </button>
            </div>
          </div>

          <div className="frow">
            <label className="field-label">
              Histórico do requerente (marque para vincular)
              {filtroHistorico && (
                <button type="button" className="nc-req-link" style={{ marginLeft: 8 }} onClick={() => setFiltroHistorico(null)}>
                  ✕ Ocultar filtro
                </button>
              )}
            </label>
            <div style={{ border: '1px solid var(--borda)', borderRadius: 8, maxHeight: 200, overflowY: 'auto' }}>
              {historicoExibido.length === 0 && (
                <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--texto-sec)' }}>
                  {!requerente
                    ? 'Selecione um requerente para ver o histórico.'
                    : filtroHistorico
                      ? 'Nenhum chamado com esse status.'
                      : 'Nenhum chamado anterior deste requerente.'}
                </div>
              )}
              {historicoExibido.map((c) => {
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
              {solucaoSugerida ? (
                <div className="nc-kb-card">
                  <div className="nc-kb-card-head">
                    <span className="nc-ai-tag">✦ Base de conhecimento</span>
                    <span className="nc-kb-card-title">{solucaoSugerida.titulo}</span>
                  </div>
                  <p className="nc-kb-card-text">{solucaoSugerida.solucao}</p>
                  <button type="button" className="btn" onClick={() => setAcaoRealizada(solucaoSugerida.solucao)}>
                    ✦ Aplicar solução da base de conhecimento
                  </button>
                </div>
              ) : (
                <div className="nc-kb-empty">Nenhum artigo relacionado encontrado na base de conhecimento — descreva a solução abaixo.</div>
              )}
              <textarea
                rows={2}
                value={acaoRealizada}
                onChange={(e) => setAcaoRealizada(e.target.value)}
                placeholder="O que foi feito para resolver?"
                style={{ marginTop: 8 }}
              />
              <button
                type="button"
                className="btn"
                style={{ marginTop: 8 }}
                onClick={() => setAcaoRealizada(reformularDescricao(acaoRealizada))}
                disabled={!acaoRealizada.trim()}
              >
                ✦ Reformular com IA
              </button>
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
                {prioridadeEntries.map((p) => (
                  <option key={p.chave} value={p.chave}>
                    {p.label}
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
