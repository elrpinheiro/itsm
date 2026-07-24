import { useMemo } from 'react'
import { Inbox, Activity, AlertTriangle, CheckCircle2, ArrowRight, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useAllProjects } from '@/store/useCatalogStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useSlaMeta, useSlaTtrMapPorProjeto } from '@/store/useSlaStore'
import { calcularSla, calcularNps } from '@/utils/chamadoMetrics'
import { statusParaTab } from '@/modules/assistencia/FilaChamadosList'
import SlaGauge from '@/components/common/SlaGauge'
import SlaComplianceBoard from './SlaComplianceBoard'
import NpsMeter from '@/components/common/NpsMeter'
import StatusDonut from '@/components/common/StatusDonut'
import type { StatusChamado } from '@/data/chamados'

const NPS_TITLE = 'NPS calculado a partir das notas de satisfação (0–10) registradas na pesquisa pós-atendimento, em todas as unidades. Sem envio automático de pesquisa nesta versão.'

/** Painel exibido antes de escolher um projeto — soma os chamados de todas as unidades do grupo,
 * na identidade visual "Mosaico" (bento/glassmorphism) usada em todo o sistema. Ver 05.29 da
 * documentação técnica. */
export default function PainelGeralModule() {
  const chamados = useChamadosStore((s) => s.chamados)
  const navigate = useNavigate()

  const naFila = chamados.filter((c) => c.status === 'Na fila').length
  const emAtendimento = chamados.filter((c) => c.status === 'Em atendimento' || c.status === 'Processando (planejado)').length
  const fechados = chamados.filter((c) => c.status === 'Fechado').length
  const criticosAbertos = chamados.filter((c) => c.prioridade === 'Crítica' && c.status !== 'Fechado').length
  const ttrMapPorProjeto = useSlaTtrMapPorProjeto()
  const projetos = useAllProjects()
  const projetoIdPorNome = useMemo(
    () => Object.fromEntries(projetos.map((p) => [`${p.nome} — ${p.cidade}`, p.id])),
    [projetos],
  )
  const sla = useMemo(
    () =>
      calcularSla(chamados, (c) => {
        const projetoId = projetoIdPorNome[c.projetoNome]
        return projetoId ? ttrMapPorProjeto[projetoId]?.[c.prioridade] : undefined
      }),
    [chamados, ttrMapPorProjeto, projetoIdPorNome],
  )
  const metaPercentual = useSlaMeta()
  const nps = useMemo(() => calcularNps(chamados), [chamados])
  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))
  const slaTitle =
    'Percentual de chamados dentro do prazo-alvo (TTR) configurado para o projeto de cada chamado — configurável em Administração → Níveis de Serviço, somando todas as unidades. Projetos ainda sem SLA definido não entram nesta conta.'

  const porCategoria = useMemo(() => {
    const contagem = new Map<string, number>()
    for (const c of chamados) {
      const chave = c.categoria || 'Sem categoria'
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
    }
    return Array.from(contagem, ([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total).slice(0, 6)
  }, [chamados])

  const porStatus = useMemo(() => {
    const buckets: StatusChamado[] = ['Na fila', 'Em atendimento', 'Processando (planejado)', 'Aguardando terceiro', 'Solucionado', 'Fechado']
    return buckets
      .map((status) => ({ status, total: chamados.filter((c) => c.status === status).length }))
      .filter((b) => b.total > 0)
  }, [chamados])

  const porUnidade = useMemo(() => {
    const contagem = new Map<string, number>()
    for (const c of chamados) {
      contagem.set(c.projetoNome, (contagem.get(c.projetoNome) ?? 0) + 1)
    }
    return Array.from(contagem, ([unidade, total]) => ({ unidade, total })).sort((a, b) => b.total - a.total).slice(0, 6)
  }, [chamados])

  const maiorCategoria = Math.max(1, ...porCategoria.map((c) => c.total))
  const maiorUnidade = Math.max(1, ...porUnidade.map((u) => u.total))

  const recentes = chamados.slice(-5).reverse()

  return (
    <div className="mod-page mos-page">
      <div className="mod-page-body">
        <div className="mod-scroll-area">
          <div className="mos">
            <div className="mos-blob b1" />
            <div className="mos-blob b2" />

            <div className="mos-top">
              <div>
                <div className="mos-eyebrow">Painel Geral</div>
                <div style={{ fontSize: 12.5, color: 'var(--mos-text-dim)', marginTop: 4 }}>Todas as unidades do grupo</div>
              </div>
              <button type="button" className="mos-cta" onClick={() => navigate('/assistencia')}>
                Ver todos os chamados <ArrowRight size={14} />
              </button>
            </div>

            <div className="mos-bento">
              <button type="button" className="mos-cell mos-k1 mos-kpi clickable" onClick={() => navigate('/assistencia?tab=novos')}>
                <div className="ic"><Inbox size={16} /></div>
                <div className="num">{naFila}</div>
                <div className="lbl">Na fila</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>
              <button type="button" className="mos-cell mos-k2 mos-kpi clickable" onClick={() => navigate('/assistencia?tab=andamento')}>
                <div className="ic"><Activity size={16} /></div>
                <div className="num">{emAtendimento}</div>
                <div className="lbl">Em atendimento</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>
              <button type="button" className="mos-cell mos-k3 mos-kpi clickable" onClick={() => navigate('/assistencia?prioridade=critica')}>
                <div className="ic crit"><AlertTriangle size={16} /></div>
                <div className="num">{criticosAbertos}</div>
                <div className="lbl">Críticos em aberto</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>
              <button type="button" className="mos-cell mos-k4 mos-kpi clickable" onClick={() => navigate('/assistencia?tab=fechados')}>
                <div className="ic good"><CheckCircle2 size={16} /></div>
                <div className="num">{fechados}</div>
                <div className="lbl">Fechados</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>

              <div className="mos-cell mos-sla">
                <h3>SLA cumprido</h3>
                <SlaGauge percentual={sla.percentual} foraDoPrazo={sla.foraDoPrazo} total={sla.total} title={slaTitle} />
              </div>
              <div className="mos-cell mos-nps">
                <h3>NPS · qualidade</h3>
                <NpsMeter nps={nps} title={NPS_TITLE} />
              </div>

              <div className="mos-cell mos-slaboard">
                <h3>Cumprimento de SLA por projeto — meta {metaPercentual}%</h3>
                <SlaComplianceBoard
                  chamados={chamados}
                  projetos={projetos}
                  ttrMapPorProjeto={ttrMapPorProjeto}
                  metaPercentual={metaPercentual}
                />
              </div>

              <div className="mos-cell mos-status">
                <h3>Status dos chamados — todas as unidades</h3>
                {porStatus.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado ainda.</div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 22, flexWrap: 'wrap' }}>
                    <StatusDonut
                      data={porStatus.map((entry) => ({ key: entry.status, total: entry.total, cor: statusMap[entry.status]?.cor ?? '#5f5e5a' }))}
                    />
                    <div className="mos-status-legend">
                      {porStatus.map((entry) => {
                        const tab = statusParaTab(entry.status)
                        return (
                          <button
                            key={entry.status}
                            type="button"
                            className={`mos-status-item${tab ? '' : ' dimmed'}`}
                            onClick={tab ? () => navigate(`/assistencia?tab=${tab}`) : undefined}
                          >
                            <span className="sw" style={{ background: statusMap[entry.status]?.cor ?? '#5f5e5a' }} />
                            {statusMap[entry.status]?.label ?? entry.status} <b>{entry.total}</b>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mos-cell mos-chart cat">
                <h3>Chamados por categoria</h3>
                {porCategoria.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado ainda.</div>
                ) : (
                  porCategoria.map((c) => (
                    <div key={c.categoria} className="mos-bar-row">
                      <div className="l">{c.categoria}</div>
                      <div className="mos-bar-track">
                        <div className="mos-bar-fill" style={{ width: `${(c.total / maiorCategoria) * 100}%` }} />
                      </div>
                      <div className="v">{c.total}</div>
                    </div>
                  ))
                )}
              </div>
              <div className="mos-cell mos-chart unit">
                <h3>Chamados por unidade</h3>
                {porUnidade.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado ainda.</div>
                ) : (
                  porUnidade.map((u) => (
                    <div key={u.unidade} className="mos-bar-row">
                      <div className="l">{u.unidade}</div>
                      <div className="mos-bar-track">
                        <div className="mos-bar-fill" style={{ width: `${(u.total / maiorUnidade) * 100}%` }} />
                      </div>
                      <div className="v">{u.total}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="mos-cell mos-list">
                <h3>Chamados recentes</h3>
                {recentes.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado ainda.</div>
                ) : (
                  <div className="mos-list-scroll">
                    {recentes.map((c) => (
                      <button
                        key={c.numero}
                        type="button"
                        className="mos-list-row"
                        onClick={() => navigate(`/assistencia?abrir=${encodeURIComponent(c.numero)}`)}
                      >
                        <span className="id">{c.numero}</span>
                        <span className="subj">{c.assunto}</span>
                        <span className="pr" style={{ color: prioridadeMap[c.prioridade]?.cor ?? 'var(--mos-text-dim)' }}>
                          {prioridadeMap[c.prioridade]?.label ?? c.prioridade}
                        </span>
                        <span className="st">
                          <span className="sw" style={{ background: statusMap[c.status]?.cor ?? '#5f5e5a' }} />
                          {statusMap[c.status]?.label ?? c.status}
                        </span>
                        <span className="t">{c.abertoHa}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
