import { TextField } from './fields'
import type { TemplateFormProps } from './types'

export default function DevolucaoForm({ data, onChange }: TemplateFormProps) {
  return (
    <>
      <TextField
        label="Usuário (colaborador)"
        placeholder="Nome de quem devolve"
        value={data.usuario ?? ''}
        onChange={(v) => onChange('usuario', v)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Dispositivo"
          placeholder="Ex.: LENOVO Notebook ThinkPad E14 c/carregador"
          value={data.dispositivo ?? ''}
          onChange={(v) => onChange('dispositivo', v)}
        />
        <TextField
          label="Patrimônio"
          placeholder="Ex.: 0847"
          value={data.patrimonio ?? ''}
          onChange={(v) => onChange('patrimonio', v)}
        />
      </div>
      <TextField
        label="Item (mouse, teclado, fone de ouvido...)"
        placeholder="Ex.: Mouse e teclado Dell e Fone de ouvido Logitech."
        value={data.itens ?? ''}
        onChange={(v) => onChange('itens', v)}
      />
      <TextField
        label="Item adicional (opcional)"
        value={data.itemExtra ?? ''}
        onChange={(v) => onChange('itemExtra', v)}
      />
    </>
  )
}
