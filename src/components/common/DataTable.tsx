import type { ReactNode } from 'react'

export interface DataTableColumn {
  key: string
  label: string
  width?: string
}

interface Props {
  columns: DataTableColumn[]
  rows: Record<string, ReactNode>[]
  emptyText?: string
  onRowClick?: (index: number) => void
  selectedIndex?: number
  /** Cor da faixa lateral esquerda por linha (ex.: cor da prioridade configurada em Listas Suspensas). */
  rowStripeColor?: (index: number) => string | undefined
}

export default function DataTable({ columns, rows, emptyText, onRowClick, selectedIndex, rowStripeColor }: Props) {
  return (
    <div className="data-table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} style={c.width ? { width: c.width } : undefined}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td className="data-table-empty" colSpan={columns.length}>
                {emptyText ?? 'Nenhum registro.'}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const stripe = rowStripeColor?.(i)
              return (
                <tr
                  key={i}
                  className={`${onRowClick ? 'clickable' : ''}${selectedIndex === i ? ' selected' : ''}`}
                  onClick={onRowClick ? () => onRowClick(i) : undefined}
                >
                  {columns.map((c, ci) => (
                    <td key={c.key} style={ci === 0 && stripe ? { boxShadow: `inset 3px 0 0 ${stripe}` } : undefined}>
                      {row[c.key]}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
