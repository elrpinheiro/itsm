import { useState } from 'react'
import { FileText, MessageCircle, Wrench, CheckCircle2, Info, Paperclip, type LucideIcon } from 'lucide-react'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useAdminStore } from '@/store/useAdminStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { badgeStyleFromColor } from '@/utils/color'
import { CICLO_VIDA_ORDEM, type OrigemAtendimento, type TipoInteracao } from '@/data/chamados'

interface Props {
  numero: string
  onClose: () => void
}

type TipoVisual = TipoInteracao | 'abertura'
type ComposerTipo = 'acompanhamento' | 'tarefa' | 'solucao'

const ORIGENS_RESPOSTA: OrigemAtendimento[] = ['Atendente', '0800 (URA)', 'WhatsApp']

const TIPO_LABEL: Record<TipoVisual, string> = {
  abertura: 'Abertura',
  acompanhamento: 'Acompanhamento',
  tarefa: 'Tarefa',
  solucao: 'Solução',
  sistema: 'Sistema',
}

const TIPO_ICON: Record<TipoVisual, LucideIcon> = {
  abertura: FileText,
  acompanhamento: MessageCircle,
  tarefa: Wrench,
  solucao: CheckCircle2,
  sistema: Info,
}

interface TimelineEntry {
  id: string
  tipoVisual: TipoVisual
  autor: string
  origem: OrigemAtendimento | 'Sistema'
  publico: boolean
  texto: string
  criadoEm: string
}

/**
 * Detalhe do chamado — timeline vertical, ciclo de vida (widget de referência com os 6 status do
 * GLPI) e ações que dirigem o status, nunca um seletor solto: assumir, planejar tarefa, reatribuir
 * grupo, registrar solução. Ao solucionar, um cartão de aceite simula a dupla assinatura antes de
 * fechar — hook simplificado para o módulo de Assinatura Digital já existente.
 */
export default function ChamadoDetalheView({ numero, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const usuarios = useAdminStore((s) => s.usuarios)
  const grupos = useAdminStore((s) => s.grupos)
  const chamado = useChamadosStore((s) => s.chamados.find((c) => c.numero === numero))
  const assumirChamado = useChamadosStore((s) => s.assumirChamado)
  const adicionarAcompanhamento = useChamadosStore((s) => s.adicionarAcompanhamento)
  const planejarTarefa = useChamadosStore((s) => s.planejarTarefa)
  const colocarPendente = useChamadosStore((s) => s.colocarPendente)
  const retomarChamado = useChamadosStore((s) => s.retomarChamado)
  const reatribuirGrupo = useChamadosStore((s) => s.reatribuirGrupo)
  const registrarSolucao = useChamadosStore((s) => s.registrarSolucao)
  const confirmarAssinatura = useChamadosStore((s) => s.confirmarAssinatura)
  const rejeitarSolucao = useChamadosStore((s) => s.rejeitarSolucao)

  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))
  const origemLabels = Object.fromEntries(useDropdownEntries('origem').map((e) => [e.chave, e.label]))

  const [composerTipo, setComposerTipo] = useState<ComposerTipo>('acompanhamento')
  const [texto, setTexto] = useState('')
  const [origem, setOrigem] = useState<OrigemAtendimento>('Atendente')
  const [privado, setPrivado] = useState(false)
  const [colocarComoPendente, setColocarComoPendente] = useState(false)

  const [mostrarReatribuir, setMostrarReatribuir] = useState(false)
  const [novoGrupoId, setNovoGrupoId] = useState('')
  const [mostrarRejeicao, setMostrarRejeicao] = useState(false)
  const [formRejeicao, setFormRejeicao] = useState('')

  if (!chamado) {
    return (
      <div className="mod-scroll-area">
        <button type="button" className="btn" onClick={onClose}>
          ← Voltar
        </button>
        <div style={{ marginTop: 14 }}>Chamado não encontrado.</div>
      </div>
    )
  }

  const autor = user?.nome ?? 'Atendente'
  const canEdit = acesso.editar
  const requerenteNome = chamado.solicitanteEmail
    ? usuarios.find((u) => u.email === chamado.solicitanteEmail)?.nome ?? chamado.solicitanteEmail
    : '—'
  const grupoNome = grupos.find((g) => g.id === chamado.grupoId)?.nome

  const timeline: TimelineEntry[] = [
    ...(chamado.descricao
      ? [
          {
            id: 'abertura',
            tipoVisual: 'abertura' as TipoVisual,
            autor: requerenteNome !== '—' ? requerenteNome : 'Requerente',
            origem: chamado.origem ?? 'Atendente',
            publico: true,
            texto: chamado.descricao,
            criadoEm: chamado.abertoHa ? `há ${chamado.abertoHa}` : '',
          },
        ]
      : []),
    ...(chamado.interacoes ?? []).map((it) => ({
      id: it.id,
      tipoVisual: it.tipo as TipoVisual,
      autor: it.autor,
      origem: it.origem,
      publico: it.publico,
      texto: it.texto,
      criadoEm: it.criadoEm,
    })),
  ]

  function resetComposer() {
    setTexto('')
    setColocarComoPendente(false)
  }

  function handleAdicionar() {
    if (!texto.trim()) return
    if (composerTipo === 'tarefa') {
      planejarTarefa(numero, texto.trim(), autor)
    } else if (composerTipo === 'solucao') {
      registrarSolucao(numero, texto.trim(), autor)
    } else if (colocarComoPendente) {
      colocarPendente(numero, texto.trim(), autor)
    } else {
      adicionarAcompanhamento(numero, { texto: texto.trim(), autor, origem, publico: !privado })
    }
    resetComposer()
    setComposerTipo('acompanhamento')
  }

  function handleReatribuir() {
    if (!novoGrupoId) return
    const grupo = grupos.find((g) => g.id === novoGrupoId)
    if (!grupo) return
    reatribuirGrupo(numero, grupo.id, grupo.nome, autor)
    setMostrarReatribuir(false)
    setNovoGrupoId('')
  }

  function handleRejeitarSolucao() {
    if (!formRejeicao.trim()) return
    rejeitarSolucao(numero, formRejeicao.trim(), autor)
    setFormRejeicao('')
    setMostrarRejeicao(false)
  }

  const podeAgir = canEdit && chamado.status !== 'Fechado' && chamado.status !== 'Solucionado'
  const cicloAtualIdx = CICLO_VIDA_ORDEM.indexOf(chamado.status)

  return (
    <div className="mod-scroll-area">
      <div className="chd-breadcrumb">
        Assistência <span>›</span> Fila de chamados <span>›</span> {chamado.numero}
      </div>

      <div className="chd-header-card">
        <div>
          <div className="chd-header-titulo">
            {chamado.numero} · {chamado.assunto}
          </div>
          {(chamado.tipoAtendimento || chamado.categoria) && (
            <div className="chd-header-sub">
              {[chamado.tipoAtendimento, chamado.categoria].filter(Boolean).join(' › ')}
            </div>
          )}
        </div>
        <span className="badge" style={badgeStyleFromColor(statusMap[chamado.status]?.cor ?? '#5f5e5a')}>
          {statusMap[chamado.status]?.label ?? chamado.status}
        </span>
      </div>

      <div className="nc-split">
        <div className="nc-left">
          <div className="chd-tl-title">Linha do tempo</div>
          <div className="chd-timeline">
            {timeline.length === 0 && <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Nenhuma interação registrada ainda.</div>}
            {timeline.map((it, i) => {
              const Icon = TIPO_ICON[it.tipoVisual]
              const mostraCanal = it.tipoVisual === 'abertura' || it.tipoVisual === 'acompanhamento'
              return (
                <div key={it.id} className={`chd-tl-item${i === timeline.length - 1 ? ' last' : ''}`}>
                  <div className={`chd-tl-avatar chd-tl-avatar-${it.tipoVisual}`}>
                    <Icon size={14} />
                  </div>
                  <div className="chd-tl-content">
                    <div className="chd-tl-head">
                      <span className="chd-tl-autor">{it.autor}</span>
                      <span className="chd-tl-tag">{TIPO_LABEL[it.tipoVisual]}</span>
                      {mostraCanal && (
                        <span className="chd-tl-tag muted">{it.origem === 'Sistema' ? 'Sistema' : origemLabels[it.origem] ?? it.origem}</span>
                      )}
                      {!it.publico && <span className="chd-tl-tag privado">Privado</span>}
                      {it.criadoEm && <span className="chd-tl-time">{it.criadoEm}</span>}
                    </div>
                    <div className="chd-tl-texto">{it.texto}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {chamado.status !== 'Fechado' && canEdit && (
            <div className="chd-composer">
              <div className="chd-composer-title">Adicionar acompanhamento</div>
              <div className="chd-composer-selects">
                <select value={composerTipo} onChange={(e) => setComposerTipo(e.target.value as ComposerTipo)}>
                  <option value="acompanhamento">Acompanhamento</option>
                  <option value="tarefa">Tarefa</option>
                  <option value="solucao">Solução</option>
                </select>
                {composerTipo === 'acompanhamento' && (
                  <>
                    <select value={origem} onChange={(e) => setOrigem(e.target.value as OrigemAtendimento)}>
                      {ORIGENS_RESPOSTA.map((o) => (
                        <option key={o} value={o}>
                          {origemLabels[o] ?? o}
                        </option>
                      ))}
                    </select>
                    <select value={privado ? 'privado' : 'publico'} onChange={(e) => setPrivado(e.target.value === 'privado')}>
                      <option value="publico">Público</option>
                      <option value="privado">Privado</option>
                    </select>
                  </>
                )}
              </div>
              <textarea
                rows={2}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={
                  composerTipo === 'tarefa'
                    ? 'Descreva a tarefa e quando será executada…'
                    : composerTipo === 'solucao'
                      ? 'O que foi feito para resolver?'
                      : 'Descreva o acompanhamento, a tarefa executada ou a solução…'
                }
              />
              <div className="chd-composer-footer">
                {composerTipo === 'acompanhamento' && (
                  <label className="chd-composer-check">
                    <input type="checkbox" checked={colocarComoPendente} onChange={(e) => setColocarComoPendente(e.target.checked)} />
                    Colocar em pendência
                  </label>
                )}
                <button type="button" className="btn" disabled title="Anexos ainda não implementados nesta versão">
                  <Paperclip size={13} /> Anexar
                </button>
                <button type="button" className="btn btn-primary" style={{ marginLeft: 'auto' }} onClick={handleAdicionar}>
                  + Adicionar
                </button>
              </div>
            </div>
          )}

          {chamado.status === 'Solucionado' && (
            <div className="chd-signature-card">
              <div className="chd-signature-title">Aguardando aceite do requerente</div>
              <p style={{ margin: '4px 0 10px', fontSize: 12.5 }}>
                Solução registrada — falta o aceite formal do requerente (dupla assinatura técnico + requerente)
                para fechar o chamado. Esta tela simula esse aceite com um clique; o fluxo completo, com foto,
                geolocalização, hash e PDF/A, é o mesmo módulo de Assinatura Digital já existente no sistema —
                a integração direta entre os dois fica para uma próxima rodada.
              </p>
              {canEdit && !mostrarRejeicao && (
                <div className="chd-actions" style={{ marginTop: 0 }}>
                  <button type="button" className="btn btn-primary" onClick={() => confirmarAssinatura(numero)}>
                    ✓ Confirmar assinatura do requerente
                  </button>
                  <button type="button" className="btn" onClick={() => setMostrarRejeicao(true)}>
                    Rejeitar solução
                  </button>
                </div>
              )}
              {mostrarRejeicao && (
                <div className="frow" style={{ marginTop: 8 }}>
                  <label className="field-label">Motivo da rejeição (reabre o chamado)</label>
                  <textarea rows={2} value={formRejeicao} onChange={(e) => setFormRejeicao(e.target.value)} placeholder="Por que a solução não resolveu?" />
                  <div className="admin-form-actions">
                    <button type="button" className="btn" onClick={() => setMostrarRejeicao(false)}>Cancelar</button>
                    <button type="button" className="btn" style={{ color: 'var(--vermelho-texto)' }} onClick={handleRejeitarSolucao}>
                      Rejeitar e reabrir
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nc-right">
          <div className="chd-sidebar-card">
            <div className="chd-sidebar-title">Ciclo de vida</div>
            <div className="chd-ciclo-lista">
              {CICLO_VIDA_ORDEM.map((s, i) => (
                <div key={s} className={`chd-ciclo-step${i < cicloAtualIdx ? ' done' : i === cicloAtualIdx ? ' current' : ''}`}>
                  <span className="chd-ciclo-marker">{i < cicloAtualIdx ? '✓' : i + 1}</span>
                  <span className="chd-ciclo-label">{statusMap[s]?.label ?? s}</span>
                </div>
              ))}
            </div>
          </div>

          {podeAgir && (
            <div className="chd-sidebar-card">
              <div className="chd-sidebar-title">Ações</div>
              <div className="chd-sidebar-actions">
                {chamado.status === 'Aguardando terceiro' ? (
                  <button type="button" className="btn chd-sidebar-btn" onClick={() => retomarChamado(numero, autor)}>
                    Retomar atendimento
                  </button>
                ) : (
                  <button type="button" className="btn chd-sidebar-btn" onClick={() => assumirChamado(numero, autor)}>
                    Assumir chamado
                  </button>
                )}
                <button type="button" className="btn chd-sidebar-btn" onClick={() => setComposerTipo('tarefa')}>
                  Planejar tarefa
                </button>
                <button type="button" className="btn chd-sidebar-btn" onClick={() => setMostrarReatribuir((v) => !v)}>
                  Reatribuir grupo
                </button>
                {mostrarReatribuir && (
                  <div className="chd-reatribuir-row">
                    <select value={novoGrupoId} onChange={(e) => setNovoGrupoId(e.target.value)}>
                      <option value="">Selecione o grupo…</option>
                      {grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nome}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn btn-primary" onClick={handleReatribuir} disabled={!novoGrupoId}>
                      Confirmar
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-primary chd-sidebar-btn" onClick={() => setComposerTipo('solucao')}>
                  ✓ Registrar solução
                </button>
              </div>
            </div>
          )}

          <div className="chd-sidebar-card">
            <div className="chd-sidebar-title">Dados</div>
            <div className="chd-dados-lista">
              <div>
                <span className="lbl">Requerente</span>
                <span>{requerenteNome}</span>
              </div>
              <div>
                <span className="lbl">Grupo/Técnico</span>
                <span>{[grupoNome, chamado.atribuidoA].filter(Boolean).join(' · ') || '—'}</span>
              </div>
              <div>
                <span className="lbl">Origem</span>
                <span>{chamado.origem ? origemLabels[chamado.origem] ?? chamado.origem : '—'}</span>
              </div>
              <div>
                <span className="lbl">Categoria</span>
                <span>{chamado.categoria ?? '—'}</span>
              </div>
              <div>
                <span className="lbl">Prioridade</span>
                <span className="badge" style={badgeStyleFromColor(prioridadeMap[chamado.prioridade]?.cor ?? '#5f5e5a')}>
                  {prioridadeMap[chamado.prioridade]?.label ?? chamado.prioridade}
                </span>
              </div>
              <div>
                <span className="lbl">Unidade</span>
                <span>{chamado.projetoNome}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" className="btn" style={{ marginTop: 16 }} onClick={onClose}>
        ← Voltar
      </button>
    </div>
  )
}
