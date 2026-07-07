import { TextField } from './fields'
import type { TemplateFormProps } from './types'

export default function TermoForm({ data, onChange }: TemplateFormProps) {
  return (
    <>
      <TextField
        label="Usuário (colaborador)"
        placeholder="Nome de quem recebe"
        value={data.usuario ?? ''}
        onChange={(v) => onChange('usuario', v)}
      />
      <TextField
        label="Dispositivo"
        placeholder="Ex.: LENOVO Notebook V14 c/ carregador · Patrimônio 0847"
        value={data.dispositivo ?? ''}
        onChange={(v) => onChange('dispositivo', v)}
      />
      <TextField
        label="Itens e acessórios"
        placeholder="Ex.: Fone de ouvido Logitech, mouse, teclado"
        value={data.itens ?? ''}
        onChange={(v) => onChange('itens', v)}
      />
      <div
        style={{
          background: 'var(--fundo)',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 11,
          color: 'var(--texto-sec)',
          lineHeight: 1.6,
          marginBottom: 6,
        }}
      >
        O termo inclui automaticamente as cláusulas de responsabilidade do template: guarda e conservação, uso
        profissional, proibição de softwares não autorizados, comunicação de perda/dano/furto com B.O., e
        devolução no desligamento. Documento gerado em 2 vias (empresa + funcionário).
      </div>
    </>
  )
}
