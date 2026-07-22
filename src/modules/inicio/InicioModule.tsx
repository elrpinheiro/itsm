import { useMemo } from 'react'
import { Inbox, Activity, AlertTriangle, CheckCircle2, Plus, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useSlaEntries, useSlaTtrMap } from '@/store/useSlaStore'
import { calcularSla, calcularNps } from '@/utils/chamadoMetrics'
import { statusParaTab } from '@/modules/assistencia/FilaChamadosList'
import SlaGauge from '@/components/common/SlaGauge'
import NpsMeter from '@/components/common/NpsMeter'
import StatusDonut from '@/components/common/StatusDonut'
import type { StatusChamado } from '@/data/chamados'

const NPS_TITLE = 'NPS calculado a partir das notas de satisfação (0–10) registradas na pesquisa pós-atendimento. Sem envio automático de pesquisa nesta versão.'

/** Painel inicial ao entrar em um projeto — indicadores derivados dos chamados reais daquela
 * unidade, na identidade visual "Mosaico" (bento/glassmorphism) usada em todo o sistema. Ver
 * 05.29 da documentação técnica. */
export default function InicioModule() {
  const project = useProjectStore((s) => s.selectedProject)
  const todosChamados = useChamadosStore((s) => s.chamados)
  const navigate = useNavigate()

  const projetoLabel = project ? `${project.nome} — ${project.cidade}` : ''
  const chamados = useMemo(() => todosChamados.filter((c) => c.projetoNome === projetoLabel), [todosChamados, projetoLabel])

  const naFila = chamados.filter((c) => c.status === 'Na fila').length
  const emAtendimento = chamados.filter((c) => c.status === 'Em atendimento' || c.status === 'Processando (planejado)').length
  const fechados = chamados.filter((c) => c.status === 'Fechado').length
  const criticosAbertos = chamados.filter((c) => c.prioridade === 'Crítica' && c.status !== 'Fechado').length
  const ttrMap = useSlaTtrMap()
  const slaEntries = useSlaEntries()
  const sla = useMemo(() => calcularSla(chamados, ttrMap), [chamados, ttrMap])
  const nps = useMemo(() => calcularNps(chamados), [chamados])
  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))
  const slaTitle = `% de chamados dentro do prazo-alvo (TTR) da prioridade (${slaEntries
    .map((e) => `${prioridadeMap[e.prioridade]?.label ?? e.prioridade} ${e.ttr}h`)
    .join(' / ')} — configurável em Administração → Níveis de Serviço).`

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

  const maiorCategoria = Math.max(1, ...porCategoria.map((c) => c.total))

  const recentes = chamados.slice(-5).reverse()

  if (!project) return null

  return (
    <div className="mod-page mos-page">
      <div className="mod-page-body">
        <div className="mod-scroll-area">
          <div className="mos">
            <div className="mos-blob b1" />
            <div className="mos-blob b2" />

            <div className="mos-top">
              <div>
                <div className="mos-eyebrow">Início — {project.nome}</div>
                <div style={{ fontSize: 12.5, color: 'var(--mos-text-dim)', marginTop: 4 }}>{project.cidade}</div>
              </div>
              <button type="button" className="mos-cta" onClick={() => navigate('/app/assistencia')}>
                <Plus size={14} /> Novo Atendimento
              </button>
            </div>

            <div className="mos-bento">
              <button type="button" className="mos-cell mos-k1 mos-kpi clickable" onClick={() => navigate('/app/assistencia?tab=novos')}>
                <div className="ic"><Inbox size={16} /></div>
                <div className="num">{naFila}</div>
                <div className="lbl">Na fila</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>
              <button type="button" className="mos-cell mos-k2 mos-kpi clickable" onClick={() => navigate('/app/assistencia?tab=andamento')}>
                <div className="ic"><Activity size={16} /></div>
                <div className="num">{emAtendimento}</div>
                <div className="lbl">Em atendimento</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>
              <button type="button" className="mos-cell mos-k3 mos-kpi clickable" onClick={() => navigate('/app/assistencia?prioridade=critica')}>
                <div className="ic crit"><AlertTriangle size={16} /></div>
                <div className="num">{criticosAbertos}</div>
                <div className="lbl">Críticos em aberto</div>
                <ArrowUpRight className="arrow" size={15} />
              </button>
              <button type="button" className="mos-cell mos-k4 mos-kpi clickable" onClick={() => navigate('/app/assistencia?tab=fechados')}>
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

              <div className="mos-cell mos-status">
                <h3>Chamados por status</h3>
                {porStatus.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado para esta unidade ainda.</div>
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
                            onClick={tab ? () => navigate(`/app/assistencia?tab=${tab}`) : undefined}
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

              <div className="mos-cell mos-chart cat full">
                <h3>Chamados por categoria</h3>
                {porCategoria.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado para esta unidade ainda.</div>
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

              <div className="mos-cell mos-list">
                <h3>Chamados recentes</h3>
                {recentes.length === 0 ? (
                  <div className="mos-empty">Nenhum chamado registrado para esta unidade ainda.</div>
                ) : (
                  <div className="mos-list-scroll">
                    {recentes.map((c) => (
                      <button
                        key={c.numero}
                        type="button"
                        className="mos-list-row"
                        onClick={() => navigate(`/app/assistencia?abrir=${encodeURIComponent(c.numero)}`)}
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
