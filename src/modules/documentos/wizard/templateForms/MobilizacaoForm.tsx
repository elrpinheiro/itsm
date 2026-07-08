import { TextField, TextAreaField, CheckboxGroupField, SectionTitle } from './fields'
import type { TemplateFormProps } from './types'
import { MOBILIZACAO_CONFIGURACAO, MOBILIZACAO_INSTALACAO_FISICA } from './mobilizacaoChecklist'

export default function MobilizacaoForm({ data, multiData, onChange, onMultiChange }: TemplateFormProps) {
  return (
    <>
      <TextField label="Projeto" value={data.projeto ?? ''} onChange={(v) => onChange('projeto', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Data"
          placeholder="08/07/2026"
          value={data.data ?? ''}
          onChange={(v) => onChange('data', v)}
        />
        <TextField label="Setor" value={data.setor ?? ''} onChange={(v) => onChange('setor', v)} />
      </div>
      <TextField
        label="Unidade escolar"
        value={data.unidadeEscolar ?? ''}
        onChange={(v) => onChange('unidadeEscolar', v)}
      />

      <SectionTitle>Configuração de equipamentos</SectionTitle>
      {MOBILIZACAO_CONFIGURACAO.map((grupo) => (
        <CheckboxGroupField
          key={grupo.key}
          label={grupo.label}
          values={multiData[`config_${grupo.key}`] ?? []}
          options={grupo.itens}
          onChange={(v) => onMultiChange(`config_${grupo.key}`, v)}
        />
      ))}

      <SectionTitle>Instalação física de equipamentos</SectionTitle>
      <CheckboxGroupField
        label="Itens instalados"
        values={multiData.instalacaoFisica ?? []}
        options={MOBILIZACAO_INSTALACAO_FISICA}
        onChange={(v) => onMultiChange('instalacaoFisica', v)}
      />

      <SectionTitle>Observações</SectionTitle>
      <TextAreaField label="Observações" value={data.obs ?? ''} onChange={(v) => onChange('obs', v)} />
    </>
  )
}
