import { TextField, TextAreaField, RadioField } from './fields'
import type { TemplateFormProps } from './types'

export default function ManutencaoForm({ data, onChange }: TemplateFormProps) {
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
      <RadioField
        label="Unifi (infraestrutura) — estado"
        name="unifi"
        value={data.unifi ?? ''}
        options={['Bom', 'Ruim']}
        onChange={(v) => onChange('unifi', v)}
      />
      <TextField label="Motivo (se ruim)" value={data.unifi_motivo ?? ''} onChange={(v) => onChange('unifi_motivo', v)} />
      <RadioField
        label="Gabinete de carga (operacional) — estado"
        name="gabinete"
        value={data.gabinete ?? ''}
        options={['Bom', 'Ruim']}
        onChange={(v) => onChange('gabinete', v)}
      />
      <TextField label="Motivo (se ruim)" value={data.gab_motivo ?? ''} onChange={(v) => onChange('gab_motivo', v)} />
      <TextAreaField
        label="Soluções da visita"
        placeholder="Descreva as soluções aplicadas..."
        value={data.solucoes ?? ''}
        onChange={(v) => onChange('solucoes', v)}
      />
    </>
  )
}
