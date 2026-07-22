import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useSlaEntries, useSlaTtrMap } from '@/store/useSlaStore'
import { calcularSla, calcularNps } from '@/utils/chamadoMetrics'
import { statusParaTab } from '@/modules/assistencia/FilaChamadosList'
import type { StatusChamado } from '@/data/chamados'

const NPS_TITLE = 'NPS calculado a partir das notas de satisfação (0–10) registradas na pesquisa pós-atendimento, em todas as unidades. Sem envio automático de pesquisa nesta versão.'

function corSlaPorFaixa(pct: number): string {
  if (pct >= 90) return 'var(--pgc-good)'
  if (pct >= 70) return 'var(--pgc-warn)'
  return 'var(--pgc-critical)'
}

/** Painel exibido antes de escolher um projeto — soma os chamados de todas as unidades do grupo.
 * Visual "Torre de Controle": tema escuro fixo, numerais monoespaçados tabulares e uma faixa de
 * saúde (barra segmentada) no lugar da rosquinha de status — estilo console de operação
 * (PagerDuty/Grafana/Datadog), escolhido entre 4 propostas de redesign. Ver 05.28 da documentação
 * técnica. Não fabrica tendência histórica (não há série temporal registrada no sistema) — por
 * isso, ao contrário da proposta visual original, os cartões de KPI não têm sparkline. */
export default function PainelGeralModule() {
  const chamados = useChamadosStore((s) => s.chamados)
  const navigate = useNavigate()

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
    .join(' / ')} — configurável em Administração → Níveis de Serviço), somando todas as unidades.`

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

  const maiorCategoria = porCategoria[0]?.total ?? 0
  const maiorUnidade = porUnidade[0]?.total ?? 0
  const totalStatus = porStatus.reduce((s, b) => s + b.total, 0)

  const recentes = chamados.slice(-5).reverse()

  const slaCor = sla.percentual === null ? 'var(--pgc-text-dim)' : corSlaPorFaixa(sla.percentual)

  return (
    <div className="mod-page pg-console-page">
      <div className="mod-page-body">
        <div className="mod-scroll-area pg-console">
          <div className="pgc-top">
            <div className="pgc-brand">
              <span className="pgc-dot" />
              <span className="pgc-eyebrow">painel geral // todas as unidades</span>
            </div>
            <button type="button" className="pgc-cta" onClick={() => navigate('/assistencia')}>
              ver todos os chamados →
            </button>
          </div>

          <div className="pgc-tiles">
            <button type="button" className="pgc-tile" style={{ ['--stripe' as string]: 'var(--pgc-accent)' }} onClick={() => navigate('/assistencia?tab=novos')}>
              <div className="pgc-tile-lbl">Na fila</div>
              <div className="pgc-tile-num pgc-mono">{String(naFila).padStart(2, '0')}</div>
              <span className="pgc-tile-arrow">↗</span>
            </button>
            <button type="button" className="pgc-tile" style={{ ['--stripe' as string]: 'var(--pgc-accent)' }} onClick={() => navigate('/assistencia?tab=andamento')}>
              <div className="pgc-tile-lbl">Em atendimento</div>
              <div className="pgc-tile-num pgc-mono">{String(emAtendimento).padStart(2, '0')}</div>
              <span className="pgc-tile-arrow">↗</span>
            </button>
            <button type="button" className="pgc-tile" style={{ ['--stripe' as string]: 'var(--pgc-critical)' }} onClick={() => navigate('/assistencia?prioridade=critica')}>
              <div className="pgc-tile-lbl">Críticos em aberto</div>
              <div className="pgc-tile-num pgc-mono" style={{ color: 'var(--pgc-critical)' }}>{String(criticosAbertos).padStart(2, '0')}</div>
              <span className="pgc-tile-arrow">↗</span>
            </button>
            <button type="button" className="pgc-tile" style={{ ['--stripe' as string]: 'var(--pgc-good)' }} onClick={() => navigate('/assistencia?tab=fechados')}>
              <div className="pgc-tile-lbl">Fechados</div>
              <div className="pgc-tile-num pgc-mono" style={{ color: 'var(--pgc-good)' }}>{String(fechados).padStart(2, '0')}</div>
              <span className="pgc-tile-arrow">↗</span>
            </button>
          </div>

          <div className="pgc-row2">
            <div className="pgc-card" title={slaTitle}>
              <h3>SLA cumprido</h3>
              <div className="pgc-gauge-row">
                <div
                  className="pgc-gauge"
                  style={{ background: `conic-gradient(${slaCor} 0% ${sla.percentual ?? 0}%, var(--pgc-line) 0)` }}
                >
                  <div className="pgc-gauge-hole">
                    <b className="pgc-mono">{sla.percentual === null ? '—' : `${sla.percentual}%`}</b>
                  </div>
                </div>
                <div className="pgc-sub">
                  Prazo por prioridade configurado em Administração → Níveis de Serviço.
                  <br />
                  {sla.total === 0 ? (
                    'Nenhum chamado registrado ainda.'
                  ) : (
                    <>
                      <b>{sla.total - sla.foraDoPrazo} de {sla.total}</b> chamados dentro do prazo.
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="pgc-card" title={NPS_TITLE}>
              <h3>NPS · qualidade</h3>
              {nps === null ? (
                <div className="pgc-sub">Nenhuma avaliação registrada ainda.</div>
              ) : (
                <>
                  <div className="pgc-nps-score pgc-mono">{nps.nps}</div>
                  <div className="pgc-nps-bar">
                    {nps.detratores > 0 && <div style={{ width: `${(nps.detratores / nps.avaliados) * 100}%`, background: 'var(--pgc-critical)' }} />}
                    {nps.neutros > 0 && <div style={{ width: `${(nps.neutros / nps.avaliados) * 100}%`, background: 'var(--pgc-warn)' }} />}
                    {nps.promotores > 0 && <div style={{ width: `${(nps.promotores / nps.avaliados) * 100}%`, background: 'var(--pgc-good)' }} />}
                  </div>
                  <div className="pgc-legend">
                    <span><span className="sw" style={{ background: 'var(--pgc-critical)' }} />Detratores {nps.detratores}</span>
                    <span><span className="sw" style={{ background: 'var(--pgc-warn)' }} />Neutros {nps.neutros}</span>
                    <span><span className="sw" style={{ background: 'var(--pgc-good)' }} />Promotores {nps.promotores}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="pgc-card" style={{ marginBottom: 14 }}>
            <h3>Status dos chamados — todas as unidades</h3>
            {porStatus.length === 0 ? (
              <div className="pgc-empty">Nenhum chamado registrado ainda.</div>
            ) : (
              <>
                <div className="pgc-health-bar">
                  {porStatus.map((entry) => {
                    const pct = (entry.total / totalStatus) * 100
                    return (
                      <div
                        key={entry.status}
                        className="pgc-health-seg"
                        style={{ width: `${pct}%`, background: statusMap[entry.status]?.cor ?? '#5f5e5a' }}
                      >
                        {pct >= 8 ? entry.total : ''}
                      </div>
                    )
                  })}
                </div>
                <div className="pgc-health-legend">
                  {porStatus.map((entry) => {
                    const tab = statusParaTab(entry.status)
                    return (
                      <button key={entry.status} type="button" className="pgc-chip" onClick={tab ? () => navigate(`/assistencia?tab=${tab}`) : undefined}>
                        <span className="sw" style={{ background: statusMap[entry.status]?.cor ?? '#5f5e5a' }} />
                        {statusMap[entry.status]?.label ?? entry.status} <b className="pgc-mono">{entry.total}</b>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="pgc-charts">
            <div className="pgc-card">
              <h3>Por categoria</h3>
              {porCategoria.length === 0 ? (
                <div className="pgc-empty">Nenhum chamado registrado ainda.</div>
              ) : (
                porCategoria.map((c) => (
                  <div key={c.categoria} className="pgc-bar-row">
                    <div className="l">{c.categoria}</div>
                    <div className="pgc-bar-track">
                      <div className="pgc-bar-fill" style={{ width: `${(c.total / maiorCategoria) * 100}%` }} />
                    </div>
                    <div className="v pgc-mono">{c.total}</div>
                  </div>
                ))
              )}
            </div>
            <div className="pgc-card">
              <h3>Por unidade</h3>
              {porUnidade.length === 0 ? (
                <div className="pgc-empty">Nenhum chamado registrado ainda.</div>
              ) : (
                porUnidade.map((u) => (
                  <div key={u.unidade} className="pgc-bar-row">
                    <div className="l">{u.unidade}</div>
                    <div className="pgc-bar-track">
                      <div className="pgc-bar-fill" style={{ width: `${(u.total / maiorUnidade) * 100}%` }} />
                    </div>
                    <div className="v pgc-mono">{u.total}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pgc-card" style={{ padding: '6px 0' }}>
            <h3 style={{ padding: '14px 22px 0' }}>Chamados recentes</h3>
            {recentes.length === 0 ? (
              <div className="pgc-empty" style={{ padding: '0 22px 14px' }}>Nenhum chamado registrado ainda.</div>
            ) : (
              <div className="pgc-log" style={{ border: 'none' }}>
                {recentes.map((c) => (
                  <button
                    key={c.numero}
                    type="button"
                    className="pgc-log-row"
                    onClick={() => navigate(`/assistencia?abrir=${encodeURIComponent(c.numero)}`)}
                  >
                    <span className="id">{c.numero}</span>
                    <span className="subj">{c.assunto}</span>
                    <span className="pr" style={{ color: prioridadeMap[c.prioridade]?.cor ?? 'var(--pgc-text-dim)' }}>
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
  )
}
