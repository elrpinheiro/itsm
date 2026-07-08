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
}

export default function DataTable({ columns, rows, emptyText }: Props) {
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
            rows.map((row, i) => (
              <tr key={i}>
                {columns.map((c) => (
                  <td key={c.key}>{row[c.key]}</td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
