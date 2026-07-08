import { TextField } from './fields'
import type { TemplateFormProps } from './types'
import EquipmentListField from './EquipmentListField'

export default function DevolucaoForm({ data, equipamentos, onChange, onEquipamentosChange }: TemplateFormProps) {
  return (
    <>
      <TextField
        label="Usuário (colaborador)"
        placeholder="Nome de quem devolve"
        value={data.usuario ?? ''}
        onChange={(v) => onChange('usuario', v)}
      />
      <EquipmentListField equipamentos={equipamentos} onChange={onEquipamentosChange} />
    </>
  )
}
