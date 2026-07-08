import type { EquipmentItem } from '@/types'

interface Props {
  equipamentos: EquipmentItem[]
  onChange: (items: EquipmentItem[]) => void
}

const DEFAULT_ROWS: EquipmentItem[] = [{ descricao: '', patrimonio: '' }]

/**
 * Lista dinâmica de equipamentos/itens para os termos de entrega e devolução —
 * permite adicionar quantas linhas forem necessárias quando o usuário retira ou
 * devolve mais de um item (ex.: notebook + celular + iPad).
 */
export default function EquipmentListField({ equipamentos, onChange }: Props) {
  const rows = equipamentos.length > 0 ? equipamentos : DEFAULT_ROWS

  function updateRow(index: number, patch: Partial<EquipmentItem>) {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }
  function removeRow(index: number) {
    onChange(rows.filter((_, i) => i !== index))
  }
  function addRow() {
    onChange([...rows, { descricao: '', patrimonio: '' }])
  }

  return (
    <div className="frow">
      <label className="field-label">Equipamentos / itens</label>
      <div>
        {rows.map((row, i) => (
          <div className="eq-row" key={i}>
            <input
              type="text"
              value={row.descricao}
              placeholder={i === 0 ? 'Ex.: Notebook Lenovo ThinkPad E14 c/carregador' : `Item ${i + 1}`}
              onChange={(e) => updateRow(i, { descricao: e.target.value })}
            />
            <input
              type="text"
              value={row.patrimonio}
              placeholder="Patrimônio (opcional)"
              style={{ maxWidth: 140, flex: 'none' }}
              onChange={(e) => updateRow(i, { patrimonio: e.target.value })}
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
        <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Adicionar equipamento
      </button>
      <div className="hint-txt">Use quando mais de um equipamento for retirado/devolvido de uma vez.</div>
    </div>
  )
}
