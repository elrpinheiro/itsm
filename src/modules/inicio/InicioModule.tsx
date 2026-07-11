import { useMemo } from 'react'
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Inbox, Activity, AlertTriangle, CheckCircle2, Timer, Smile, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { SLA_TARGET_HORAS, calcularSla, calcularNps } from '@/utils/chamadoMetrics'
import type { Prioridade, StatusChamado } from '@/data/chamados'

const SLA_TITLE = `% de chamados dentro do prazo-alvo da prioridade (Crítica ${SLA_TARGET_HORAS.Crítica}h / Alta ${SLA_TARGET_HORAS.Alta}h / Média ${SLA_TARGET_HORAS.Média}h / Baixa ${SLA_TARGET_HORAS.Baixa}h — política padrão do MVP, ajustável por contrato).`
const NPS_TITLE = 'NPS calculado a partir das notas de satisfação (0–10) registradas na pesquisa pós-atendimento. Sem envio automático de pesquisa nesta versão.'

const STATUS_COLOR: Record<StatusChamado, string> = {
  'Na fila': '#854f0b',
  'Em atendimento': '#185fa5',
  'Aguardando terceiro': '#8b8f83',
  Fechado: '#3b6d11',
}

const PRIORIDADE_CLASS: Record<Prioridade, string> = {
  Baixa: 'badge-blue',
  Média: 'badge-amber',
  Alta: 'badge-amber',
  Crítica: '',
}

const PRIORIDADE_STRIPE: Record<Prioridade, string> = {
  Baixa: 'row-prio-baixa',
  Média: 'row-prio-media',
  Alta: 'row-prio-alta',
  Crítica: 'row-prio-critica',
}

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
  const emAtendimento = chamados.filter((c) => c.status === 'Em atendimento').length
  const fechados = chamados.filter((c) => c.status === 'Fechado').length
  const criticosAbertos = chamados.filter((c) => c.prioridade === 'Crítica' && c.status !== 'Fechado').length
  const sla = useMemo(() => calcularSla(chamados), [chamados])
  const nps = useMemo(() => calcularNps(chamados), [chamados])

  const porCategoria = useMemo(() => {
    const contagem = new Map<string, number>()
    for (const c of chamados) {
      const chave = c.categoria || 'Sem categoria'
      contagem.set(chave, (contagem.get(chave) ?? 0) + 1)
    }
    return Array.from(contagem, ([categoria, total]) => ({ categoria, total })).sort((a, b) => b.total - a.total).slice(0, 6)
  }, [chamados])

  const porStatus = useMemo(() => {
    const buckets: StatusChamado[] = ['Na fila', 'Em atendimento', 'Aguardando terceiro', 'Fechado']
    return buckets
      .map((status) => ({ status, total: chamados.filter((c) => c.status === status).length }))
      .filter((b) => b.total > 0)
  }, [chamados])

  const recentes = chamados.slice(-5).reverse()
  const rows = recentes.map((c) => ({
    numero: <b>{c.numero}</b>,
    assunto: c.assunto,
    prioridade: (
      <span className={`badge ${PRIORIDADE_CLASS[c.prioridade]}`} style={c.prioridade === 'Crítica' ? { background: '#fdeaea', color: '#a30000' } : undefined}>
        {c.prioridade}
      </span>
    ),
    status: <span style={{ color: STATUS_COLOR[c.status], fontWeight: 600, fontSize: 12 }}>{c.status}</span>,
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
            <div className="inicio-kpi">
              <div className="inicio-kpi-ic neutral"><Inbox size={16} /></div>
              <div className="inicio-kpi-num">{naFila}</div>
              <div className="inicio-kpi-lbl">Na fila</div>
            </div>
            <div className="inicio-kpi">
              <div className="inicio-kpi-ic neutral"><Activity size={16} /></div>
              <div className="inicio-kpi-num">{emAtendimento}</div>
              <div className="inicio-kpi-lbl">Em atendimento</div>
            </div>
            <div className="inicio-kpi">
              <div className="inicio-kpi-ic crit"><AlertTriangle size={16} /></div>
              <div className="inicio-kpi-num">{criticosAbertos}</div>
              <div className="inicio-kpi-lbl">Críticos em aberto</div>
            </div>
            <div className="inicio-kpi">
              <div className="inicio-kpi-ic good"><CheckCircle2 size={16} /></div>
              <div className="inicio-kpi-num">{fechados}</div>
              <div className="inicio-kpi-lbl">Fechados</div>
            </div>
            <div className="inicio-kpi" title={SLA_TITLE}>
              <div className="inicio-kpi-ic neutral"><Timer size={16} /></div>
              <div className="inicio-kpi-num">{sla.percentual === null ? '—' : `${sla.percentual}%`}</div>
              <div className="inicio-kpi-lbl">SLA cumprido</div>
            </div>
            <div className="inicio-kpi" title={NPS_TITLE}>
              <div className="inicio-kpi-ic good"><Smile size={16} /></div>
              <div className="inicio-kpi-num">{nps === null ? '—' : nps.nps}</div>
              <div className="inicio-kpi-lbl">{nps === null ? 'NPS (sem avaliações)' : `NPS (${nps.avaliados} avaliações)`}</div>
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
                    <Tooltip cursor={{ fill: 'var(--fundo)' }} formatter={(v) => [v, 'chamados']} />
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
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={porStatus} dataKey="total" nameKey="status" innerRadius={38} outerRadius={56} paddingAngle={2}>
                        {porStatus.map((entry) => (
                          <Cell key={entry.status} fill={STATUS_COLOR[entry.status]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="inicio-legend">
                    {porStatus.map((entry) => (
                      <div key={entry.status} className="inicio-legend-item">
                        <span className="sw" style={{ background: STATUS_COLOR[entry.status] }} />
                        {entry.status} <b>{entry.total}</b>
                      </div>
                    ))}
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
              rowClassName={(i) => PRIORIDADE_STRIPE[recentes[i].prioridade]}
              emptyText="Nenhum chamado registrado para esta unidade ainda."
            />
          </div>
        </div>
      </div>
    </div>
  )
}
