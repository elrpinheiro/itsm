import { TextField, TextAreaField, RadioField } from './fields'
import type { TemplateFormProps } from './types'

export default function ReciboForm({ data, onChange }: TemplateFormProps) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Data"
          placeholder="06/06/2026"
          value={data.data ?? ''}
          onChange={(v) => onChange('data', v)}
        />
        <TextField
          label="Departamento"
          placeholder="Infraestrutura de Projetos"
          value={data.departamento ?? ''}
          onChange={(v) => onChange('departamento', v)}
        />
      </div>
      <TextField label="Entregue por" value={data.entregue ?? ''} onChange={(v) => onChange('entregue', v)} />
      <TextField label="Recebido por" value={data.recebido ?? ''} onChange={(v) => onChange('recebido', v)} />
      <TextAreaField
        label="Relação de materiais/equipamentos entregues"
        placeholder="Liste os itens..."
        value={data.materiais ?? ''}
        onChange={(v) => onChange('materiais', v)}
      />
      <RadioField
        label="Recebimento"
        name="confirma"
        value={data.confirma ?? ''}
        options={['Confirmo recebimento', 'Recuso recebimento']}
        onChange={(v) => onChange('confirma', v)}
      />
      <TextField label="Motivo (em caso de recusa)" value={data.motivo ?? ''} onChange={(v) => onChange('motivo', v)} />
    </>
  )
}
