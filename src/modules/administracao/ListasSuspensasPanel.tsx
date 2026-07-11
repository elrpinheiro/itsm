import { useState } from 'react'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useDropdownsStore, useDropdownEntries, type DropdownTipo } from '@/store/useDropdownsStore'

const SECOES: { tipo: DropdownTipo; titulo: string; comCor: boolean }[] = [
  { tipo: 'prioridade', titulo: 'Prioridade', comCor: true },
  { tipo: 'status', titulo: 'Status do chamado', comCor: true },
  { tipo: 'origem', titulo: 'Origem do atendimento', comCor: false },
]

const COLUMNS_COM_COR: DataTableColumn[] = [
  { key: 'chave', label: 'Chave', width: '160px' },
  { key: 'label', label: 'Rótulo exibido' },
  { key: 'cor', label: 'Cor', width: '90px' },
  { key: 'ativo', label: 'Ativo', width: '70px' },
]

const COLUMNS_SEM_COR: DataTableColumn[] = [
  { key: 'chave', label: 'Chave', width: '160px' },
  { key: 'label', label: 'Rótulo exibido' },
  { key: 'ativo', label: 'Ativo', width: '70px' },
]

function Secao({ tipo, titulo, comCor, canEdit }: { tipo: DropdownTipo; titulo: string; comCor: boolean; canEdit: boolean }) {
  const entries = useDropdownEntries(tipo)
  const updateEntry = useDropdownsStore((s) => s.updateEntry)

  const rows = entries.map((e) => ({
    chave: <code style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>{e.chave}</code>,
    label: canEdit ? (
      <input
        value={e.label}
        onChange={(ev) => updateEntry(tipo, e.chave, { label: ev.target.value })}
        style={{ width: '100%', fontSize: 12.5, padding: '5px 8px' }}
      />
    ) : (
      e.label
    ),
    cor: comCor ? (
      canEdit ? (
        <input
          type="color"
          value={e.cor}
          onChange={(ev) => updateEntry(tipo, e.chave, { cor: ev.target.value })}
          style={{ width: 40, height: 26, padding: 0, border: '1px solid var(--borda)', borderRadius: 6, cursor: 'pointer' }}
          title={e.cor}
        />
      ) : (
        <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: 5, background: e.cor, border: '1px solid var(--borda)' }} />
      )
    ) : undefined,
    ativo: (
      <input
        type="checkbox"
        checked={e.ativo}
        disabled={!canEdit}
        onChange={(ev) => updateEntry(tipo, e.chave, { ativo: ev.target.checked })}
      />
    ),
  }))

  return (
    <div style={{ marginBottom: 22 }}>
      <div className="mod-section-title" style={{ fontSize: 14, marginBottom: 10 }}>
        {titulo}
      </div>
      <DataTable columns={comCor ? COLUMNS_COM_COR : COLUMNS_SEM_COR} rows={rows} emptyText="Nenhum valor cadastrado." />
    </div>
  )
}

/** Administração das listas suspensas (Prioridade / Status / Origem) — no espírito do módulo
 * "Listas suspensas" do GLPI: rótulo, cor e ativo/inativo são editáveis pelo admin; a chave interna
 * (usada por SLA, gráficos e badges em todo o sistema) é fixa, para não quebrar essas referências. */
export default function ListasSuspensasPanel({ canEdit }: { canEdit: boolean }) {
  const [tab, setTab] = useState<DropdownTipo>('prioridade')

  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 14, maxWidth: 640 }}>
        Assim como no GLPI (Configurar → Listas suspensas), estes são os valores usados nos chamados do
        sistema todo. Você pode renomear o rótulo exibido, mudar a cor e desativar um valor (ele deixa de
        aparecer para novos chamados, mas continua nos chamados antigos). A chave interna não é editável —
        é o que mantém o SLA e os gráficos funcionando mesmo depois de uma mudança de rótulo.
      </div>
      <div className="mod-page-tabs" style={{ marginBottom: 14 }}>
        {SECOES.map((s) => (
          <span key={s.tipo} className={`chip${tab === s.tipo ? ' on' : ''}`} onClick={() => setTab(s.tipo)}>
            {s.titulo}
          </span>
        ))}
      </div>
      {SECOES.filter((s) => s.tipo === tab).map((s) => (
        <Secao key={s.tipo} tipo={s.tipo} titulo={s.titulo} comCor={s.comCor} canEdit={canEdit} />
      ))}
    </div>
  )
}
