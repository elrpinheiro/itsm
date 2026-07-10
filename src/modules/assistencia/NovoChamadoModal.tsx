import { useMemo, useState } from 'react'
import Modal from '@/components/common/Modal'
import { useAdminStore } from '@/store/useAdminStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { classificarAtendimento, reformularDescricao } from '@/data/classificarChamado'
import { PROJECT_CATALOGS, type ClassificationLabel } from '@/data/catalog'
import type { OrigemAtendimento, Prioridade, StatusChamado } from '@/data/chamados'
import type { Usuario } from '@/data/administracaoMock'
import type { Project } from '@/types'

interface Props {
  project: Project
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

const PRIORIDADES: Prioridade[] = ['Baixa', 'Média', 'Alta', 'Crítica']
const TIPOS: ClassificationLabel[] = ['Requisição', 'Incidente', 'Problema', 'Habilitação de Mudanças']

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/)
  return ((partes[0]?.[0] ?? '') + (partes[1]?.[0] ?? '')).toUpperCase()
}

/** Novo chamado — requerente carrega os dados reais, a IA sugere categoria/tipo/prioridade/grupo a
 * partir da descrição (não importa a origem do atendimento), e o histórico do requerente aponta
 * recorrência antes de decidir se o chamado já sai resolvido. */
export default function NovoChamadoModal({ project, onClose }: Props) {
  const usuarios = useAdminStore((s) => s.usuarios)
  const grupos = useAdminStore((s) => s.grupos)
  const chamados = useChamadosStore((s) => s.chamados)
  const addChamado = useChamadosStore((s) => s.addChamado)
  const catalog = PROJECT_CATALOGS[project.id]
  const projetoLabel = `${project.nome} — ${project.cidade}`

  const [busca, setBusca] = useState('')
  const [requerente, setRequerente] = useState<Usuario | null>(null)
  const [origem, setOrigem] = useState<OrigemAtendimento>('Atendente')
  const [vinculados, setVinculados] = useState<string[]>([])
  const [descricao, setDescricao] = useState('')
  const [acaoRealizada, setAcaoRealizada] = useState('')
  const [solucionado, setSolucionado] = useState<boolean | null>(null)
  const [error, setError] = useState('')

  const [categoria, setCategoria] = useState('')
  const [tipoAtendimento, setTipoAtendimento] = useState<ClassificationLabel>('Requisição')
  const [prioridade, setPrioridade] = useState<Prioridade>('Média')
  const [grupoId, setGrupoId] = useState('')

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

  function selecionarRequerente(u: Usuario) {
    setRequerente(u)
    setBusca('')
  }

  function toggleVinculo(numero: string) {
    setVinculados((prev) => (prev.includes(numero) ? prev.filter((n) => n !== numero) : [...prev, numero]))
  }

  function aplicarIA(textoBase: string) {
    const limpo = reformularDescricao(textoBase)
    setDescricao(limpo)
    const sugestao = classificarAtendimento(limpo, catalog)
    setCategoria(sugestao.categoria)
    setTipoAtendimento(sugestao.tipoAtendimento)
    setPrioridade(sugestao.prioridade)
    setGrupoId(sugestao.grupoId)
  }

  function handleDescricaoChange(v: string) {
    setDescricao(v)
    if (v.trim().length > 8) {
      const sugestao = classificarAtendimento(v, catalog)
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
      prioridade,
      descricao,
      solicitanteEmail: requerente.email,
      categoria: categoria || 'Outros',
      tipoAtendimento,
      grupoId: grupoId || 'grp-n1',
      origem,
      vinculados,
      resolvidoNaHora: solucionado,
      acaoRealizada: solucionado ? acaoRealizada : undefined,
    })
    onClose()
  }

  return (
    <Modal title="Novo chamado" onClose={onClose} wide>
      <div className="frow">
        <label className="field-label">Requerente</label>
        {!requerente ? (
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
                  <div key={u.id} className="nc-req-result" onClick={() => selecionarRequerente(u)}>
                    <b>{u.nome}</b>
                    <div className="sub">{u.email}{u.cargo ? ` · ${u.cargo}` : ''}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="nc-req-card">
            <div className="nc-req-avatar">{iniciais(requerente.nome)}</div>
            <div className="nc-req-grid">
              <div>
                <div className="lbl">Nome</div>
                <div className="val">{requerente.nome}</div>
              </div>
              <div>
                <div className="lbl">Login / e-mail</div>
                <div className="val">{requerente.email}</div>
              </div>
              <div>
                <div className="lbl">Cargo / categoria</div>
                <div className="val">{requerente.cargo ?? requerente.categoria ?? '—'}</div>
              </div>
              <div>
                <div className="lbl">Telefone</div>
                <div className="val">{requerente.celular ?? requerente.telefone ?? '—'}</div>
              </div>
              <div>
                <div className="lbl">Entidade</div>
                <div className="val">{projetoLabel}</div>
              </div>
            </div>
            <button type="button" className="btn" style={{ fontSize: 11, padding: '5px 9px', flexShrink: 0 }} onClick={() => setRequerente(null)}>
              Trocar
            </button>
          </div>
        )}
      </div>

      {requerente && (
        <>
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
            <div className="nc-status-bar">
              <div className="nc-status-chip"><b>{nAndamento}</b> Em andamento</div>
              <div className="nc-status-chip"><b>{nPendente}</b> Pendente</div>
              <div className="nc-status-chip"><b>{nFechado}</b> Fechado</div>
            </div>
          </div>

          {historico.length > 0 && (
            <div className="frow">
              <label className="field-label">Histórico do requerente (marque para vincular)</label>
              <div style={{ border: '1px solid var(--borda)', borderRadius: 8, maxHeight: 160, overflowY: 'auto' }}>
                {historico.map((c) => (
                  <label key={c.numero} className="nc-hist-row">
                    <input type="checkbox" checked={vinculados.includes(c.numero)} onChange={() => toggleVinculo(c.numero)} />
                    <span className="nc-hist-num">{c.numero}</span>
                    <span className="nc-hist-title">{c.assunto}</span>
                    <span className="badge">{c.status}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {recorrencia && (
            <div className="nc-insight">
              <span>⚠️</span>
              <span>
                <b>{recorrencia.total}º chamado de "{recorrencia.categoria}"</b> deste requerente — padrão recorrente,
                pode indicar causa raiz. Considere abrir uma avaliação além do reparo.
              </span>
            </div>
          )}

          <div className="frow" style={{ marginTop: 14 }}>
            <label className="field-label">Descrição do atendimento</label>
            <textarea
              rows={3}
              value={descricao}
              onChange={(e) => handleDescricaoChange(e.target.value)}
              placeholder="Descreva o que o requerente relatou…"
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button type="button" className="btn" onClick={() => aplicarIA(descricao)}>
                ✦ Reformular com IA
              </button>
              <button type="button" className="btn" onClick={() => setDescricao('')}>
                Limpar
              </button>
            </div>
          </div>

          <div className="frow">
            <label className="field-label">
              Classificação <span className="nc-ai-tag">✦ Sugestão IA</span>
            </label>
            <div className="nc-classif-grid">
              <div className="nc-classif-cell">
                <div className="lbl">Categoria</div>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                  {(catalog ?? []).map((item) => (
                    <option key={item.label} value={item.label}>
                      {item.icon} {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="nc-classif-cell">
                <div className="lbl">Tipo de atendimento</div>
                <select value={tipoAtendimento} onChange={(e) => setTipoAtendimento(e.target.value as ClassificationLabel)}>
                  {TIPOS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="nc-classif-cell">
                <div className="lbl">Prioridade</div>
                <select value={prioridade} onChange={(e) => setPrioridade(e.target.value as Prioridade)}>
                  {PRIORIDADES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="nc-classif-cell">
                <div className="lbl">Grupo de atendimento</div>
                <select value={grupoId} onChange={(e) => setGrupoId(e.target.value)}>
                  {grupos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nome}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="frow">
            <label className="field-label">Chamado solucionado?</label>
            <div className="nc-decision">
              <div className={`opt yes${solucionado === true ? ' chosen' : ''}`} onClick={() => setSolucionado(true)}>
                <div className="t">✓ Sim</div>
                <div className="d">Chamado será finalizado com a ação abaixo como solução.</div>
              </div>
              <div className={`opt no${solucionado === false ? ' chosen' : ''}`} onClick={() => setSolucionado(false)}>
                <div className="t">✕ Não</div>
                <div className="d">Chamado fica aberto, encaminhado ao grupo acima.</div>
              </div>
            </div>
          </div>

          {solucionado && (
            <div className="frow">
              <label className="field-label">Ação realizada</label>
              <textarea rows={2} value={acaoRealizada} onChange={(e) => setAcaoRealizada(e.target.value)} placeholder="O que foi feito para resolver?" />
            </div>
          )}
        </>
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
    </Modal>
  )
}
