import { TextField, TextAreaField } from './fields'
import type { TemplateFormProps } from './types'
import type { ChecklistItem } from '@/types'

const LINHAS_PADRAO = 13
const DEFAULT_ROWS: ChecklistItem[] = Array.from({ length: LINHAS_PADRAO }, () => ({ descricao: '' }))

export default function HomologacaoForm({ data, checklist, onChange, onChecklistChange }: TemplateFormProps) {
  const rows = checklist.length > 0 ? checklist : DEFAULT_ROWS

  function updateRow(index: number, descricao: string) {
    onChecklistChange(rows.map((row, i) => (i === index ? { descricao } : row)))
  }
  function removeRow(index: number) {
    onChecklistChange(rows.filter((_, i) => i !== index))
  }
  function addRow() {
    onChecklistChange([...rows, { descricao: '' }])
  }

  return (
    <>
      <TextField label="Município/Projeto" value={data.municipio ?? ''} onChange={(v) => onChange('municipio', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField label="Data" placeholder="06/06/2026" value={data.data ?? ''} onChange={(v) => onChange('data', v)} />
        <TextField label="Setor" placeholder="TIC" value={data.setor ?? ''} onChange={(v) => onChange('setor', v)} />
      </div>
      <TextField
        label="Item analisado"
        placeholder="Ex.: Notebook Lenovo V14 — Lote 02"
        value={data.item ?? ''}
        onChange={(v) => onChange('item', v)}
      />
      <div className="frow">
        <label className="field-label">Checklist de especificações</label>
        <div>
          {rows.map((row, i) => (
            <div className="eq-row" key={i}>
              <span style={{ color: 'var(--verde)', fontSize: 14, flexShrink: 0 }}>✔</span>
              <input
                type="text"
                value={row.descricao}
                placeholder={`Descritivo do item ${i + 1}`}
                onChange={(e) => updateRow(i, e.target.value)}
              />
              {rows.length > 1 && (
                <span className="x" onClick={() => removeRow(i)}>
                  ✕
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          className="btn"
          style={{ fontSize: 12, padding: '5px 12px', marginTop: 2 }}
          onClick={addRow}
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Adicionar item
        </button>
      </div>
      <TextAreaField label="Observação" value={data.obs ?? ''} onChange={(v) => onChange('obs', v)} />
    </>
  )
}
