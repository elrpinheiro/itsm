import { TextField, TextAreaField, RadioField, CheckboxGroupField, SectionTitle } from './fields'
import type { TemplateFormProps } from './types'
import { FORMATACAO_PROCESSOS, FORMATACAO_SOFTWARES } from './formatacaoProcessos'

export default function FormatacaoForm({ data, multiData, onChange, onMultiChange }: TemplateFormProps) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <TextField label="Número da OS" value={data.numeroOS ?? ''} onChange={(v) => onChange('numeroOS', v)} />
        <TextField label="Patrimônio" value={data.patrimonio ?? ''} onChange={(v) => onChange('patrimonio', v)} />
        <TextField
          label="Data"
          placeholder="08/07/2026"
          value={data.data ?? ''}
          onChange={(v) => onChange('data', v)}
        />
      </div>

      <SectionTitle>Softwares necessários</SectionTitle>
      <CheckboxGroupField
        label="Selecione os softwares a instalar"
        values={multiData.softwares ?? []}
        options={FORMATACAO_SOFTWARES}
        onChange={(v) => onMultiChange('softwares', v)}
      />
      <TextField
        label="Outros softwares (verificar requisitos do projeto)"
        value={data.outrosSoftwares ?? ''}
        onChange={(v) => onChange('outrosSoftwares', v)}
      />

      <SectionTitle>Processo de formatação</SectionTitle>
      {FORMATACAO_PROCESSOS.map((p) => (
        <div key={p.key} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: '1px solid #F1EFE8' }}>
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{p.processo}</div>
          <div style={{ fontSize: 11, color: 'var(--texto-sec)', marginBottom: 6 }}>{p.detalhamento}</div>
          <RadioField
            label="Realizado?"
            name={`proc_${p.key}_realizado`}
            value={data[`proc_${p.key}_realizado`] ?? ''}
            options={['Sim', 'Não']}
            onChange={(v) => onChange(`proc_${p.key}_realizado`, v)}
          />
          <TextField
            label="Observação"
            value={data[`proc_${p.key}_obs`] ?? ''}
            onChange={(v) => onChange(`proc_${p.key}_obs`, v)}
          />
        </div>
      ))}

      <TextAreaField label="Observações gerais" value={data.obs ?? ''} onChange={(v) => onChange('obs', v)} />
    </>
  )
}
