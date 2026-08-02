import { useState } from 'react'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllProjects } from '@/store/useCatalogStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useMetaBacklog, useSlaEntries, useSlaMeta, useSlaStore } from '@/store/useSlaStore'
import type { Prioridade } from '@/data/chamados'

const COLUMNS: DataTableColumn[] = [
  { key: 'entidade', label: 'Entidade', width: '200px' },
  { key: 'prioridade', label: 'Prioridade', width: '140px' },
  { key: 'tto', label: 'TTO — assumir (h)', width: '160px' },
  { key: 'ttr', label: 'TTR — resolver (h)', width: '160px' },
]

const ORDEM_PRIORIDADE: Prioridade[] = ['Crítica', 'Alta', 'Média', 'Baixa']

/** Administração de Níveis de Serviço (SLA) — inspirada no módulo "Níveis de serviço" do GLPI: TTO
 * (Time To Own, prazo para assumir) e TTR (Time To Resolve, prazo para resolver) configuráveis por
 * prioridade, por entidade (projeto), em vez de fixos no código ou únicos para todo o sistema. Um
 * projeto sem nenhuma linha simplesmente não tem SLA definido ainda — os dashboards mostram "Sem SLA
 * configurado" em vez de aplicar a política de outro projeto. */
export default function NiveisServicoPanel({ canEdit }: { canEdit: boolean }) {
  const currentProject = useProjectStore((s) => s.selectedProject)
  const projetos = useAllProjects()
  const [entidadeFiltro, setEntidadeFiltro] = useState(currentProject?.id ?? '')
  const entradas = useSlaEntries(entidadeFiltro || undefined)
  const updateSla = useSlaStore((s) => s.updateSla)
  const metaPercentual = useSlaMeta()
  const setMetaPercentual = useSlaStore((s) => s.setMetaPercentual)
  const metaBacklogPercentual = useMetaBacklog()
  const setMetaBacklogPercentual = useSlaStore((s) => s.setMetaBacklogPercentual)
  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))
  const projetoMap = Object.fromEntries(projetos.map((p) => [p.id, `${p.nome} — ${p.cidade}`]))

  // Ordena por entidade e depois pela ordem canônica de prioridade — sem depender da ordem de
  // inserção nas entradas (que cresce conforme o admin edita linhas novas).
  const linhas = [...entradas].sort((a, b) => {
    const entidadeCmp = (projetoMap[a.projetoId] ?? '').localeCompare(projetoMap[b.projetoId] ?? '')
    if (entidadeCmp !== 0) return entidadeCmp
    return ORDEM_PRIORIDADE.indexOf(a.prioridade) - ORDEM_PRIORIDADE.indexOf(b.prioridade)
  })

  const rows = linhas.map((e) => ({
    entidade: projetoMap[e.projetoId] ?? '—',
    prioridade: (
      <span className="badge" style={{ background: '#f1efe8', color: prioridadeMap[e.prioridade]?.cor ?? '#5f5e5a' }}>
        {prioridadeMap[e.prioridade]?.label ?? e.prioridade}
      </span>
    ),
    tto: canEdit ? (
      <input
        type="number"
        min={0}
        step={0.5}
        value={e.tto}
        onChange={(ev) => updateSla(e.projetoId, e.prioridade, { tto: Number(ev.target.value) })}
        style={{ width: 80, fontSize: 12.5, padding: '5px 8px' }}
      />
    ) : (
      `${e.tto}h`
    ),
    ttr: canEdit ? (
      <input
        type="number"
        min={0}
        step={0.5}
        value={e.ttr}
        onChange={(ev) => updateSla(e.projetoId, e.prioridade, { ttr: Number(ev.target.value) })}
        style={{ width: 80, fontSize: 12.5, padding: '5px 8px' }}
      />
    ) : (
      `${e.ttr}h`
    ),
  }))

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div className="mod-section-title" style={{ marginBottom: 0, fontSize: 14 }}>
          Níveis de Serviço (SLA)
        </div>
        {currentProject ? (
          <select value={entidadeFiltro} disabled style={{ width: 'auto', fontSize: 12.5, padding: '6px 10px' }} title="Unidade atual — fixa, mude de projeto para ver outra">
            <option value={entidadeFiltro}>{projetoMap[entidadeFiltro] ?? currentProject.nome}</option>
          </select>
        ) : (
          <select
            value={entidadeFiltro}
            onChange={(e) => setEntidadeFiltro(e.target.value)}
            style={{ width: 'auto', fontSize: 12.5, padding: '6px 10px' }}
            title="Filtrar por entidade (projeto)"
          >
            <option value="">Todas as entidades</option>
            {projetos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome} — {p.cidade}
              </option>
            ))}
          </select>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 14, maxWidth: 640 }}>
        Mesma terminologia do GLPI: <strong>TTO</strong> (Time To Own — prazo para um técnico assumir o
        chamado) e <strong>TTR</strong> (Time To Resolve — prazo para resolver), em horas, por prioridade
        e por entidade. Hoje o sistema mede automaticamente só o <strong>TTR</strong> (usado no KPI "SLA
        cumprido" do Início e do Painel Geral) — não há registro de quando um técnico assume um chamado,
        então o TTO fica salvo como referência, sem indicador de cumprimento ainda. O relógio do TTR só
        conta o expediente (<strong>08:00–18:00</strong>) em dias que não são sábado, domingo nem feriado
        nacional — exceto para chamados <strong>Críticos (P1)</strong>, que mantêm atendimento contínuo
        24x7. Um chamado <strong>Pendente</strong> (Aguardando terceiro, Pendente Fornecedor ou Pendente
        Cliente/Colaborador) tem o relógio travado o tempo todo, independente do expediente — fica de fora
        do cálculo de "SLA cumprido" até sair da pendência. Uma entidade sem nenhuma linha ainda não tem SLA
        definido.
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <label className="field-label" style={{ margin: 0 }}>
          Meta de cumprimento de SLA
        </label>
        {canEdit ? (
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={metaPercentual}
            onChange={(ev) => setMetaPercentual(Number(ev.target.value))}
            style={{ width: 70, fontSize: 12.5, padding: '5px 8px' }}
          />
        ) : (
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>{metaPercentual}%</span>
        )}
        {canEdit && <span style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>% — mesma regra para todos os projetos, usada no Painel Geral e no Início.</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <label className="field-label" style={{ margin: 0 }}>
          Meta de backlog
        </label>
        {canEdit ? (
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            value={metaBacklogPercentual}
            onChange={(ev) => setMetaBacklogPercentual(Number(ev.target.value))}
            style={{ width: 70, fontSize: 12.5, padding: '5px 8px' }}
          />
        ) : (
          <span style={{ fontSize: 12.5, fontWeight: 700 }}>{metaBacklogPercentual}%</span>
        )}
        {canEdit && (
          <span style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>
            % — backlog (chamados em aberto) não deve passar disso em relação aos chamados abertos no mês, em nenhum projeto.
          </span>
        )}
      </div>
      <DataTable columns={COLUMNS} rows={rows} emptyText="Nenhum SLA definido nesta entidade." />
    </div>
  )
}
