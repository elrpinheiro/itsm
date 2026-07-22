import { useMemo } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Inbox, Activity, AlertTriangle, CheckCircle2, Plus, ArrowUpRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useSlaEntries, useSlaTtrMap } from '@/store/useSlaStore'
import { badgeStyleFromColor } from '@/utils/color'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { calcularSla, calcularNps } from '@/utils/chamadoMetrics'
import { statusParaTab } from '@/modules/assistencia/FilaChamadosList'
import SlaGauge from '@/components/common/SlaGauge'
import NpsMeter from '@/components/common/NpsMeter'
import StatusDonut from '@/components/common/StatusDonut'
import type { StatusChamado } from '@/data/chamados'

const NPS_TITLE = 'NPS calculado a partir das notas de satisfação (0–10) registradas na pesquisa pós-atendimento. Sem envio automático de pesquisa nesta versão.'

const CHART_TOOLTIP_STYLE = { background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: 8, fontSize: 12.5 }
const CHART_TOOLTIP_LABEL_STYLE = { color: 'var(--texto)' }
const CHART_TOOLTIP_ITEM_STYLE = { color: 'var(--texto-sec)' }

const COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Nº', width: '80px' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'prioridade', label: 'Prioridade', width: '110px' },
  { key: 'status', label: 'Status', width: '150px' },
  { key: 'abertoHa', label: 'Aberto há', width: '90px' },
]

/** Painel inicial ao entrar em um projeto — indicadores e gráficos derivados dos chamados reais
 * daquela unidade (sem dado inventado: KPIs de SLA e NPS deixam claro no título as premissas assumidas). */
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

  const recentes = chamados.slice(-5).reverse()
  const rows = recentes.map((c) => ({
    numero: <b>{c.numero}</b>,
    assunto: c.assunto,
    prioridade: (
      <span className="badge" style={badgeStyleFromColor(prioridadeMap[c.prioridade]?.cor ?? '#5f5e5a')}>
        {prioridadeMap[c.prioridade]?.label ?? c.prioridade}
      </span>
    ),
    status: (
      <span style={{ color: statusMap[c.status]?.cor ?? '#5f5e5a', fontWeight: 600, fontSize: 12 }}>
        {statusMap[c.status]?.label ?? c.status}
      </span>
    ),
    abertoHa: c.abertoHa,
  }))

  if (!project) return null

  return (
    <div className="mod-page">
      <div className="mod-page-body">
        <div className="mod-scroll-area">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            <div>
              <div className="mod-section-title" style={{ marginBottom: 2 }}>
                Início — {project.nome}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--texto-sec)' }}>{project.cidade}</div>
            </div>
            <button
              className="btn btn-primary"
              style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
              onClick={() => navigate('/app/assistencia')}
            >
              <Plus size={14} /> Novo Atendimento
            </button>
          </div>

          <div className="inicio-kpis">
            <button type="button" className="inicio-kpi clickable" onClick={() => navigate('/app/assistencia?tab=novos')}>
              <div className="inicio-kpi-ic neutral"><Inbox size={16} /></div>
              <div className="inicio-kpi-num">{naFila}</div>
              <div className="inicio-kpi-lbl">Na fila</div>
              <ArrowUpRight className="inicio-kpi-arrow" size={15} />
            </button>
            <button type="button" className="inicio-kpi clickable" onClick={() => navigate('/app/assistencia?tab=andamento')}>
              <div className="inicio-kpi-ic neutral"><Activity size={16} /></div>
              <div className="inicio-kpi-num">{emAtendimento}</div>
              <div className="inicio-kpi-lbl">Em atendimento</div>
              <ArrowUpRight className="inicio-kpi-arrow" size={15} />
            </button>
            <button type="button" className="inicio-kpi clickable" onClick={() => navigate('/app/assistencia?prioridade=critica')}>
              <div className="inicio-kpi-ic crit"><AlertTriangle size={16} /></div>
              <div className="inicio-kpi-num">{criticosAbertos}</div>
              <div className="inicio-kpi-lbl">Críticos em aberto</div>
              <ArrowUpRight className="inicio-kpi-arrow" size={15} />
            </button>
            <button type="button" className="inicio-kpi clickable" onClick={() => navigate('/app/assistencia?tab=fechados')}>
              <div className="inicio-kpi-ic good"><CheckCircle2 size={16} /></div>
              <div className="inicio-kpi-num">{fechados}</div>
              <div className="inicio-kpi-lbl">Fechados</div>
              <ArrowUpRight className="inicio-kpi-arrow" size={15} />
            </button>
          </div>

          <div className="inicio-quality-row">
            <div className="inicio-panel">
              <SlaGauge percentual={sla.percentual} foraDoPrazo={sla.foraDoPrazo} total={sla.total} title={slaTitle} />
            </div>
            <div className="inicio-panel">
              <NpsMeter nps={nps} title={NPS_TITLE} />
            </div>
          </div>

          <div className="inicio-panels">
            <div className="inicio-panel">
              <h3>Chamados por categoria</h3>
              {porCategoria.length === 0 ? (
                <div className="inicio-empty">Nenhum chamado registrado para esta unidade ainda.</div>
              ) : (
                <ResponsiveContainer width="100%" height={Math.max(120, porCategoria.length * 34)}>
                  <BarChart data={porCategoria} layout="vertical" margin={{ top: 4, right: 20, bottom: 4, left: 4 }}>
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis type="category" dataKey="categoria" width={110} tick={{ fontSize: 12, fill: 'var(--texto-sec)' }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--fundo)' }} formatter={(v) => [v, 'chamados']} contentStyle={CHART_TOOLTIP_STYLE} labelStyle={CHART_TOOLTIP_LABEL_STYLE} itemStyle={CHART_TOOLTIP_ITEM_STYLE} />
                    <Bar dataKey="total" fill="var(--tema)" radius={[0, 5, 5, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="inicio-panel">
              <h3>Chamados por status</h3>
              {porStatus.length === 0 ? (
                <div className="inicio-empty">Nenhum chamado registrado para esta unidade ainda.</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <StatusDonut
                    data={porStatus.map((entry) => ({ key: entry.status, total: entry.total, cor: statusMap[entry.status]?.cor ?? '#5f5e5a' }))}
                  />
                  <div className="inicio-legend">
                    {porStatus.map((entry) => {
                      const tab = statusParaTab(entry.status)
                      return (
                        <button
                          key={entry.status}
                          type="button"
                          className={`inicio-legend-item${tab ? ' clickable' : ''}`}
                          onClick={tab ? () => navigate(`/app/assistencia?tab=${tab}`) : undefined}
                        >
                          <span className="sw" style={{ background: statusMap[entry.status]?.cor ?? '#5f5e5a' }} />
                          {statusMap[entry.status]?.label ?? entry.status} <b>{entry.total}</b>
                          {tab && <ArrowUpRight className="ic-go" size={12} />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 4 }}>
            <div className="mod-section-title" style={{ fontSize: 15, marginBottom: 10 }}>
              Chamados recentes
            </div>
            <DataTable
              columns={COLUMNS}
              rows={rows}
              rowStripeColor={(i) => prioridadeMap[recentes[i].prioridade]?.cor}
              emptyText="Nenhum chamado registrado para esta unidade ainda."
              onRowClick={(i) => navigate(`/app/assistencia?abrir=${encodeURIComponent(recentes[i].numero)}`)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
