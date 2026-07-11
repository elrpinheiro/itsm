import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useSlaEntries, useSlaStore } from '@/store/useSlaStore'

const COLUMNS: DataTableColumn[] = [
  { key: 'prioridade', label: 'Prioridade', width: '140px' },
  { key: 'tto', label: 'TTO — assumir (h)', width: '160px' },
  { key: 'ttr', label: 'TTR — resolver (h)', width: '160px' },
]

/** Administração de Níveis de Serviço (SLA) — inspirada no módulo "Níveis de serviço" do GLPI: TTO
 * (Time To Own, prazo para assumir) e TTR (Time To Resolve, prazo para resolver) configuráveis por
 * prioridade, em vez de fixos no código. */
export default function NiveisServicoPanel({ canEdit }: { canEdit: boolean }) {
  const entradas = useSlaEntries()
  const updateSla = useSlaStore((s) => s.updateSla)
  const prioridadeMap = Object.fromEntries(useDropdownEntries('prioridade').map((e) => [e.chave, e]))

  const rows = entradas.map((e) => ({
    prioridade: (
      <span className="badge" style={{ background: '#f1efe8', color: prioridadeMap[e.prioridade]?.cor ?? '#5f5e5a' }}>
        {prioridadeMap[e.prioridade]?.label ?? e.prioridade}
      </span>
    ),
    tto: canEdit ? (
      <input
        type="number"
        min={0}
        value={e.tto}
        onChange={(ev) => updateSla(e.prioridade, { tto: Number(ev.target.value) })}
        style={{ width: 80, fontSize: 12.5, padding: '5px 8px' }}
      />
    ) : (
      `${e.tto}h`
    ),
    ttr: canEdit ? (
      <input
        type="number"
        min={0}
        value={e.ttr}
        onChange={(ev) => updateSla(e.prioridade, { ttr: Number(ev.target.value) })}
        style={{ width: 80, fontSize: 12.5, padding: '5px 8px' }}
      />
    ) : (
      `${e.ttr}h`
    ),
  }))

  return (
    <div>
      <div className="mod-section-title" style={{ fontSize: 14, marginBottom: 10 }}>
        Níveis de Serviço (SLA)
      </div>
      <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 14, maxWidth: 640 }}>
        Mesma terminologia do GLPI: <strong>TTO</strong> (Time To Own — prazo para um técnico assumir o
        chamado) e <strong>TTR</strong> (Time To Resolve — prazo para resolver), em horas, por prioridade.
        Hoje o sistema mede automaticamente só o <strong>TTR</strong> (usado no KPI "SLA cumprido" do
        Início e do Painel Geral) — não há registro de quando um técnico assume um chamado, então o TTO
        fica salvo como referência, sem indicador de cumprimento ainda. O cálculo também não usa
        calendário de expediente (trata o tempo como corrido, 24×7, sem pausar em fins de semana,
        feriados ou enquanto o chamado está "Aguardando terceiro") — no GLPI isso é resolvido associando
        um calendário ao SLA, o que pode ser uma evolução futura deste módulo.
      </div>
      <DataTable columns={COLUMNS} rows={rows} emptyText="Nenhuma prioridade cadastrada." />
    </div>
  )
}
