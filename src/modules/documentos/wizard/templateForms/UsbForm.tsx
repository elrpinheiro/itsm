import { TextField, TextAreaField } from './fields'
import type { TemplateFormProps } from './types'

export default function UsbForm({ data, onChange }: TemplateFormProps) {
  return (
    <>
      <TextField label="Usuário (colaborador)" value={data.usuario ?? ''} onChange={(v) => onChange('usuario', v)} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Dispositivo"
          placeholder="Ex.: LENOVO Notebook ThinkPad E14"
          value={data.dispositivo ?? ''}
          onChange={(v) => onChange('dispositivo', v)}
        />
        <TextField label="Patrimônio" value={data.patrimonio ?? ''} onChange={(v) => onChange('patrimonio', v)} />
      </div>
      <TextField
        label="Nome do computador"
        value={data.nomeComputador ?? ''}
        onChange={(v) => onChange('nomeComputador', v)}
      />
      <TextAreaField
        label="Motivo da utilização"
        placeholder="Justificativa operacional para uso da porta USB..."
        value={data.motivo ?? ''}
        onChange={(v) => onChange('motivo', v)}
      />
      <div
        style={{
          background: 'var(--fundo)',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 11,
          color: 'var(--texto-sec)',
          lineHeight: 1.6,
        }}
      >
        Validade de 90 dias após a assinatura. O termo inclui automaticamente as cláusulas de risco de segurança da
        informação, compromissos de uso e ciência sobre auditoria/monitoramento do modelo original.
      </div>
    </>
  )
}
