import { TextField, TextAreaField, RadioField, CheckboxGroupField, SectionTitle } from './fields'
import type { TemplateFormProps } from './types'
import { MANUT_EQUIPAMENTOS } from './manutEquipamentos'

export default function ManutencaoForm({ data, multiData, onChange, onMultiChange }: TemplateFormProps) {
  return (
    <>
      <TextField
        label="Nome do projeto e local de visita"
        placeholder="Ex.: Projeto Conecta — EMEF João XXIII"
        value={data.projeto ?? ''}
        onChange={(v) => onChange('projeto', v)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Cidade/Estado"
          placeholder="Jacareí/SP"
          value={data.cidade ?? ''}
          onChange={(v) => onChange('cidade', v)}
        />
        <TextField
          label="Data e horário da visita"
          placeholder="06/06/2026 · 09:00"
          value={data.datahora ?? ''}
          onChange={(v) => onChange('datahora', v)}
        />
      </div>
      <TextAreaField
        label="Objetivo da visita"
        placeholder="Manutenção preventiva trimestral"
        value={data.objetivo ?? ''}
        onChange={(v) => onChange('objetivo', v)}
      />

      <SectionTitle>Checklist — Recursos de Infraestrutura</SectionTitle>
      {MANUT_EQUIPAMENTOS.filter((eq) => eq.coluna === 'infra').map((eq) => {
        const estado = data[`${eq.key}_estado`] ?? ''
        const motivo = multiData[`${eq.key}_motivo`] ?? []
        return (
          <div key={eq.key}>
            <RadioField
              label={eq.label}
              name={`${eq.key}_estado`}
              value={estado}
              options={eq.estadoOptions}
              onChange={(v) => onChange(`${eq.key}_estado`, v)}
            />
            {estado === 'Ruim' && (
              <CheckboxGroupField
                label="Motivo (se ruim)"
                values={motivo}
                options={eq.motivoOptions}
                onChange={(v) => onMultiChange(`${eq.key}_motivo`, v)}
              />
            )}
          </div>
        )
      })}

      <SectionTitle>Checklist — Recursos Operacionais</SectionTitle>
      {MANUT_EQUIPAMENTOS.filter((eq) => eq.coluna === 'oper').map((eq) => {
        const estado = data[`${eq.key}_estado`] ?? ''
        const motivo = multiData[`${eq.key}_motivo`] ?? []
        return (
          <div key={eq.key}>
            <RadioField
              label={eq.label}
              name={`${eq.key}_estado`}
              value={estado}
              options={eq.estadoOptions}
              onChange={(v) => onChange(`${eq.key}_estado`, v)}
            />
            {estado === 'Ruim' && (
              <CheckboxGroupField
                label="Motivo (se ruim)"
                values={motivo}
                options={eq.motivoOptions}
                onChange={(v) => onMultiChange(`${eq.key}_motivo`, v)}
              />
            )}
          </div>
        )
      })}
      <TextField
        label="Outros (se necessário indicar em soluções de visita) — Especifique"
        value={data.outros ?? ''}
        onChange={(v) => onChange('outros', v)}
      />

      <SectionTitle>Soluções da visita</SectionTitle>
      <TextAreaField
        label="Descreva as soluções aplicadas"
        placeholder="Descreva as soluções aplicadas..."
        value={data.solucoes ?? ''}
        onChange={(v) => onChange('solucoes', v)}
      />
    </>
  )
}
