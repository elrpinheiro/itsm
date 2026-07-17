import { useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { badgeStyleFromColor } from '@/utils/color'
import type { OrigemAtendimento, TipoInteracao } from '@/data/chamados'

interface Props {
  numero: string
  onClose: () => void
}

const ORIGENS_RESPOSTA: OrigemAtendimento[] = ['Atendente', '0800 (URA)', 'WhatsApp']

const TIPO_ICON: Record<TipoInteracao, string> = {
  acompanhamento: '💬',
  tarefa: '🛠️',
  solucao: '✅',
  sistema: '•',
}

function bubbleClass(tipo: TipoInteracao): string {
  if (tipo === 'sistema') return 'nc-chat-bubble note'
  if (tipo === 'solucao') return 'nc-chat-bubble chd-bubble-solucao'
  if (tipo === 'tarefa') return 'nc-chat-bubble chd-bubble-tarefa'
  return 'nc-chat-bubble in'
}

/**
 * Detalhe do chamado — timeline central (acompanhamentos/tarefas/solução/sistema) e ações que
 * dirigem o status, no espírito do ciclo de vida do GLPI: o status é consequência de uma ação
 * (assumir, agendar tarefa, solucionar, aceite do requerente), nunca um seletor solto.
 */
export default function ChamadoDetalheView({ numero, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const acesso = useModuleAccess('assistencia')
  const chamado = useChamadosStore((s) => s.chamados.find((c) => c.numero === numero))
  const assumirChamado = useChamadosStore((s) => s.assumirChamado)
  const adicionarAcompanhamento = useChamadosStore((s) => s.adicionarAcompanhamento)
  const agendarTarefa = useChamadosStore((s) => s.agendarTarefa)
  const colocarPendente = useChamadosStore((s) => s.colocarPendente)
  const retomarChamado = useChamadosStore((s) => s.retomarChamado)
  const registrarSolucao = useChamadosStore((s) => s.registrarSolucao)
  const confirmarAssinatura = useChamadosStore((s) => s.confirmarAssinatura)
  const rejeitarSolucao = useChamadosStore((s) => s.rejeitarSolucao)

  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))
  const origemLabels = Object.fromEntries(useDropdownEntries('origem').map((e) => [e.chave, e.label]))

  const [resposta, setResposta] = useState('')
  const [respostaOrigem, setRespostaOrigem] = useState<OrigemAtendimento>('Atendente')
  const [respostaPrivada, setRespostaPrivada] = useState(false)

  const [mostrarTarefa, setMostrarTarefa] = useState(false)
  const [formTarefa, setFormTarefa] = useState('')
  const [mostrarPendencia, setMostrarPendencia] = useState(false)
  const [formPendencia, setFormPendencia] = useState('')
  const [mostrarSolucao, setMostrarSolucao] = useState(false)
  const [formSolucao, setFormSolucao] = useState('')
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
  const interacoes = chamado.interacoes ?? []

  function handleResponder() {
    if (!resposta.trim()) return
    adicionarAcompanhamento(numero, { texto: resposta.trim(), autor, origem: respostaOrigem, publico: !respostaPrivada })
    setResposta('')
  }

  function handleAgendarTarefa() {
    if (!formTarefa.trim()) return
    agendarTarefa(numero, formTarefa.trim(), autor)
    setFormTarefa('')
    setMostrarTarefa(false)
  }

  function handleColocarPendente() {
    if (!formPendencia.trim()) return
    colocarPendente(numero, formPendencia.trim(), autor)
    setFormPendencia('')
    setMostrarPendencia(false)
  }

  function handleRegistrarSolucao() {
    if (!formSolucao.trim()) return
    registrarSolucao(numero, formSolucao.trim(), autor)
    setFormSolucao('')
    setMostrarSolucao(false)
  }

  function handleRejeitarSolucao() {
    if (!formRejeicao.trim()) return
    rejeitarSolucao(numero, formRejeicao.trim(), autor)
    setFormRejeicao('')
    setMostrarRejeicao(false)
  }

  return (
    <div className="mod-scroll-area">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <button type="button" className="btn" onClick={onClose}>
          ← Voltar
        </button>
        <div className="mod-section-title" style={{ marginBottom: 0 }}>
          {chamado.numero} — {chamado.assunto}
        </div>
        <div className="chd-header-badges">
          <span className="badge" style={badgeStyleFromColor(statusMap[chamado.status]?.cor ?? '#5f5e5a')}>
            {statusMap[chamado.status]?.label ?? chamado.status}
          </span>
          <span className="badge" style={badgeStyleFromColor(prioridadeMap[chamado.prioridade]?.cor ?? '#5f5e5a')}>
            {prioridadeMap[chamado.prioridade]?.label ?? chamado.prioridade}
          </span>
          {chamado.origem && <span className="badge badge-blue">{origemLabels[chamado.origem] ?? chamado.origem}</span>}
        </div>
      </div>

      <div className="nc-split">
        <div className="nc-left">
          <div className="nc-chat" style={{ minHeight: 120 }}>
            {chamado.descricao && (
              <div className="nc-chat-bubble in">
                <div className="nc-chat-meta">Descrição inicial{chamado.origem ? ` · ${origemLabels[chamado.origem] ?? chamado.origem}` : ''}</div>
                <div>{chamado.descricao}</div>
              </div>
            )}
            {interacoes.length === 0 && !chamado.descricao && (
              <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Nenhuma interação registrada ainda.</div>
            )}
            {interacoes.map((it) => (
              <div key={it.id} className={bubbleClass(it.tipo)}>
                <div className="nc-chat-meta">
                  {TIPO_ICON[it.tipo]} {it.autor}
                  {it.tipo !== 'sistema' && ` · ${origemLabels[it.origem] ?? it.origem}`} · {it.criadoEm}
                  {!it.publico && <span className="chd-tag-privado">🔒 Privado</span>}
                </div>
                <div>{it.texto}</div>
              </div>
            ))}
          </div>

          {chamado.status !== 'Fechado' && canEdit && (
            <div className="frow" style={{ marginTop: 10 }}>
              <label className="field-label">Responder</label>
              <div className="nc-composer">
                <textarea
                  rows={2}
                  value={resposta}
                  onChange={(e) => setResposta(e.target.value)}
                  placeholder="Escreva um acompanhamento para o requerente…"
                />
                <button type="button" className="nc-composer-send" onClick={handleResponder} title="Enviar">
                  ➤
                </button>
              </div>
              <div className="chd-composer-opts">
                <label className="field-label-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  Origem
                  <select value={respostaOrigem} onChange={(e) => setRespostaOrigem(e.target.value as OrigemAtendimento)} style={{ width: 'auto', padding: '3px 6px', fontSize: 11.5 }}>
                    {ORIGENS_RESPOSTA.map((o) => (
                      <option key={o} value={o}>
                        {origemLabels[o] ?? o}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field-label-hint" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <input type="checkbox" checked={respostaPrivada} onChange={(e) => setRespostaPrivada(e.target.checked)} />
                  Privado (só entre técnicos)
                </label>
              </div>
            </div>
          )}

          {canEdit && chamado.status === 'Na fila' && (
            <div className="chd-actions">
              <button type="button" className="btn btn-primary" onClick={() => assumirChamado(numero, autor)}>
                Assumir chamado
              </button>
            </div>
          )}

          {canEdit && (chamado.status === 'Em atendimento' || chamado.status === 'Aguardando terceiro') && (
            <div className="chd-actions">
              {chamado.status === 'Aguardando terceiro' ? (
                <button type="button" className="btn" onClick={() => retomarChamado(numero, autor)}>
                  Retomar atendimento
                </button>
              ) : (
                <>
                  <button type="button" className="btn" onClick={() => setMostrarTarefa((v) => !v)}>
                    🛠️ Agendar tarefa
                  </button>
                  <button type="button" className="btn" onClick={() => setMostrarPendencia((v) => !v)}>
                    Colocar em pendência
                  </button>
                </>
              )}
              <button type="button" className="btn btn-primary" onClick={() => setMostrarSolucao((v) => !v)}>
                ✓ Registrar solução
              </button>
            </div>
          )}

          {mostrarTarefa && (
            <div className="frow" style={{ marginTop: 10 }}>
              <label className="field-label">Tarefa técnica</label>
              <textarea rows={2} value={formTarefa} onChange={(e) => setFormTarefa(e.target.value)} placeholder="O que precisa ser feito e quando?" />
              <div className="admin-form-actions">
                <button type="button" className="btn" onClick={() => setMostrarTarefa(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleAgendarTarefa}>Agendar</button>
              </div>
            </div>
          )}

          {mostrarPendencia && (
            <div className="frow" style={{ marginTop: 10 }}>
              <label className="field-label">Motivo da pendência</label>
              <textarea rows={2} value={formPendencia} onChange={(e) => setFormPendencia(e.target.value)} placeholder="Ex.: aguardando retorno do requerente / peça do fornecedor…" />
              <div className="admin-form-actions">
                <button type="button" className="btn" onClick={() => setMostrarPendencia(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleColocarPendente}>Colocar em pendência</button>
              </div>
            </div>
          )}

          {mostrarSolucao && (
            <div className="frow" style={{ marginTop: 10 }}>
              <label className="field-label">Solução</label>
              <textarea rows={2} value={formSolucao} onChange={(e) => setFormSolucao(e.target.value)} placeholder="O que foi feito para resolver?" />
              <div className="admin-form-actions">
                <button type="button" className="btn" onClick={() => setMostrarSolucao(false)}>Cancelar</button>
                <button type="button" className="btn btn-primary" onClick={handleRegistrarSolucao}>Registrar solução</button>
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
          <div className="nc-summary-head">
            <div className="t">Detalhes</div>
            <div className="d">dados do chamado</div>
          </div>
          <div className="nc-summary-card">
            <span className="nc-summary-ic on">•</span>
            <div className="nc-summary-body">
              <div className="lbl">Projeto</div>
              <div>{chamado.projetoNome}</div>
            </div>
          </div>
          {chamado.solicitanteEmail && (
            <div className="nc-summary-card">
              <span className="nc-summary-ic on">•</span>
              <div className="nc-summary-body">
                <div className="lbl">Requerente</div>
                <div>{chamado.solicitanteEmail}</div>
              </div>
            </div>
          )}
          {chamado.categoria && (
            <div className="nc-summary-card">
              <span className="nc-summary-ic on">•</span>
              <div className="nc-summary-body">
                <div className="lbl">Categoria</div>
                <div>{chamado.categoria}</div>
              </div>
            </div>
          )}
          {chamado.tipoAtendimento && (
            <div className="nc-summary-card">
              <span className="nc-summary-ic on">•</span>
              <div className="nc-summary-body">
                <div className="lbl">Tipo de atendimento</div>
                <div>{chamado.tipoAtendimento}</div>
              </div>
            </div>
          )}
          <div className="nc-summary-card">
            <span className={`nc-summary-ic${chamado.atribuidoA ? ' on' : ''}`}>{chamado.atribuidoA ? '✓' : '•'}</span>
            <div className="nc-summary-body">
              <div className="lbl">Atribuído a</div>
              <div>{chamado.atribuidoA ?? 'Ninguém ainda'}</div>
            </div>
          </div>
          {chamado.ativosVinculados && chamado.ativosVinculados.length > 0 && (
            <div className="nc-summary-card">
              <span className="nc-summary-ic on">•</span>
              <div className="nc-summary-body">
                <div className="lbl">Ativos vinculados</div>
                <div>{chamado.ativosVinculados.join(', ')}</div>
              </div>
            </div>
          )}
          {chamado.acaoRealizada && (
            <div className="nc-summary-card">
              <span className="nc-summary-ic on">✓</span>
              <div className="nc-summary-body">
                <div className="lbl">Ação realizada</div>
                <div>{chamado.acaoRealizada}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
