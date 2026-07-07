import { TextField, TextAreaField, RadioField } from './fields'
import type { TemplateFormProps } from './types'

export default function ChecklistForm({ data, onChange }: TemplateFormProps) {
  return (
    <>
      <TextField label="Projeto" value={data.projeto ?? ''} onChange={(v) => onChange('projeto', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Data/hora"
          placeholder="06/06/2026 · 09:00"
          value={data.datahora ?? ''}
          onChange={(v) => onChange('datahora', v)}
        />
        <TextField label="E-mail/telefone" value={data.contato ?? ''} onChange={(v) => onChange('contato', v)} />
      </div>
      <TextField label="Unidade escolar" value={data.unidade ?? ''} onChange={(v) => onChange('unidade', v)} />
      <TextField label="Endereço" value={data.endereco ?? ''} onChange={(v) => onChange('endereco', v)} />
      <RadioField
        label="Tensão elétrica"
        name="tensao"
        value={data.tensao ?? ''}
        options={['220V', '110V']}
        onChange={(v) => onChange('tensao', v)}
      />
      <TextAreaField
        label="Considerações para projeto (infraestrutura)"
        placeholder="Área livre disponível, pontos de rede..."
        value={data.infra ?? ''}
        onChange={(v) => onChange('infra', v)}
      />
      <TextAreaField label="Observações" value={data.obs ?? ''} onChange={(v) => onChange('obs', v)} />
    </>
  )
}
