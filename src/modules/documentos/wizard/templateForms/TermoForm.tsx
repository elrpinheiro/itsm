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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <TextField
          label="Dispositivo"
          placeholder="Ex.: LENOVO Notebook ThinkPad E14 c/carregador"
          value={data.dispositivo ?? ''}
          onChange={(v) => onChange('dispositivo', v)}
        />
        <TextField
          label="Patrimônio"
          placeholder="Ex.: 0847"
          value={data.patrimonio ?? ''}
          onChange={(v) => onChange('patrimonio', v)}
        />
      </div>
      <TextField
        label="Item (mouse, teclado, fone de ouvido...)"
        placeholder="Ex.: Mouse e teclado Dell e Fone de ouvido Logitech."
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
        O termo inclui automaticamente as cláusulas de responsabilidade do modelo original: guarda, conservação e
        uso adequado; uso exclusivamente profissional; proibição de softwares não autorizados e compartilhamento;
        respeito à LGPD (Lei 13.709/2018); sistemas de proteção e monitoramento corporativo; comunicação imediata
        de perda, dano, furto ou extravio; e devolução dos equipamentos no desligamento. Documento gerado em 2 vias
        (empresa + funcionário).
      </div>
    </>
  )
}
