import { TextField, TextAreaField, SectionTitle, RadioField } from './fields'
import type { TemplateFormProps } from './types'
import { GMUD_ETAPAS } from './gmudEtapas'
import { VISIBILIDADE_OPTIONS } from './mudancaVisibilidade'

export default function GmudForm({ data, onChange }: TemplateFormProps) {
  return (
    <>
      <TextField
        label="Título da mudança"
        placeholder="Ex.: Atualização do firewall perimetral"
        value={data.titulo ?? ''}
        onChange={(v) => onChange('titulo', v)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Data/Hora"
          placeholder="08/07/2026 – 22:00"
          value={data.dataHora ?? ''}
          onChange={(v) => onChange('dataHora', v)}
        />
        <TextField
          label="Nº do chamado (TIC)"
          placeholder="0007/2026"
          value={data.ticNumero ?? ''}
          onChange={(v) => onChange('ticNumero', v)}
        />
      </div>
      <TextField
        label="Responsável pela execução"
        value={data.responsavel ?? ''}
        onChange={(v) => onChange('responsavel', v)}
      />
      <RadioField
        label="Visibilidade"
        name="visibilidade"
        value={data.visibilidade ?? ''}
        options={VISIBILIDADE_OPTIONS}
        onChange={(v) => onChange('visibilidade', v)}
      />

      <SectionTitle>Progresso</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {GMUD_ETAPAS.map((etapa) => (
          <TextField
            key={etapa.key}
            label={etapa.label}
            placeholder="Horário"
            value={data[`etapa_${etapa.key}`] ?? ''}
            onChange={(v) => onChange(`etapa_${etapa.key}`, v)}
          />
        ))}
      </div>

      <SectionTitle>Escopo</SectionTitle>
      <TextAreaField
        label="Escopo da mudança"
        placeholder="Descreva o que será alterado e por quê..."
        value={data.escopo ?? ''}
        onChange={(v) => onChange('escopo', v)}
      />

      <SectionTitle>Informações adicionais</SectionTitle>
      <TextAreaField
        label="Informações adicionais"
        placeholder="Riscos, plano de contingência, contatos de suporte..."
        value={data.infoAdicionais ?? ''}
        onChange={(v) => onChange('infoAdicionais', v)}
      />
    </>
  )
}
