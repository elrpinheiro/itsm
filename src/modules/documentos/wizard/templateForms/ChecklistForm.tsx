import { TextField, TextAreaField, RadioField, CheckboxGroupField, SectionTitle } from './fields'
import type { TemplateFormProps } from './types'

const SIM_NAO = ['Sim', 'Não']

export default function ChecklistForm({ data, multiData, onChange, onMultiChange }: TemplateFormProps) {
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

      <SectionTitle>Estrutura local</SectionTitle>
      <RadioField
        label="Tensão elétrica"
        name="tensao"
        value={data.tensao ?? ''}
        options={['220V', '110V']}
        onChange={(v) => onChange('tensao', v)}
      />
      <RadioField
        label="Tipo de tomadas"
        name="tomadas"
        value={data.tomadas ?? ''}
        options={['Tomadas 10A', 'Tomadas 20A']}
        onChange={(v) => onChange('tomadas', v)}
      />
      <CheckboxGroupField
        label="Conexão de internet existente"
        values={multiData.conexaoInternet ?? []}
        options={['Fibra Óptica', 'Cabo Coaxial', 'Rádio', '4G/5G (Roteador)']}
        onChange={(v) => onMultiChange('conexaoInternet', v)}
      />
      <CheckboxGroupField
        label="Segurança"
        values={multiData.seguranca ?? []}
        options={[
          'Grades em portas',
          'Grades em Janelas',
          'Alarmes de Segurança',
          'Monitoramento por Câmeras',
          'Cerca Elétrica',
          'Caseiro no local',
          'Luzes de Emergência',
          'Extintores de incêndio',
        ]}
        onChange={(v) => onMultiChange('seguranca', v)}
      />
      <RadioField
        label="Forro"
        name="forro"
        value={data.forro ?? ''}
        options={['Laje', 'PVC', 'Madeira', 'Gesso']}
        onChange={(v) => onChange('forro', v)}
      />
      <RadioField
        label="Piso"
        name="piso"
        value={data.piso ?? ''}
        options={['Cerâmica', 'Vinílico', 'Madeira']}
        onChange={(v) => onChange('piso', v)}
      />
      <CheckboxGroupField
        label="Condições da parede"
        values={multiData.condicoesParede ?? []}
        options={['Lisa', 'Possui itens de fácil remoção', 'Possui itens difíceis de remover']}
        onChange={(v) => onMultiChange('condicoesParede', v)}
      />
      <RadioField
        label="Iluminação"
        name="iluminacao"
        value={data.iluminacao ?? ''}
        options={['Boa iluminação natural', 'Necessidade de melhorias na iluminação']}
        onChange={(v) => onChange('iluminacao', v)}
      />
      <RadioField
        label="Ventilação"
        name="ventilacao"
        value={data.ventilacao ?? ''}
        options={['Boa ventilação natural', 'Necessidade de melhorias na ventilação']}
        onChange={(v) => onChange('ventilacao', v)}
      />
      <RadioField
        label="Ruído"
        name="ruido"
        value={data.ruido ?? ''}
        options={['Ambiente silencioso', 'Ambiente com ruído moderado', 'Ambiente ruidoso']}
        onChange={(v) => onChange('ruido', v)}
      />
      <RadioField
        label="Possui colunas"
        name="colunas"
        value={data.colunas ?? ''}
        options={SIM_NAO}
        onChange={(v) => onChange('colunas', v)}
      />

      <SectionTitle>Considerações para projeto</SectionTitle>
      <RadioField
        label="Área livre disponível para a instalação dos equipamentos de TI?"
        name="areaLivre"
        value={data.areaLivre ?? ''}
        options={SIM_NAO}
        onChange={(v) => onChange('areaLivre', v)}
      />
      <RadioField
        label="Necessidade de nobreaks para os equipamentos de TI?"
        name="nobreaks"
        value={data.nobreaks ?? ''}
        options={SIM_NAO}
        onChange={(v) => onChange('nobreaks', v)}
      />
      <RadioField
        label="Estrutura para instalação de link de internet"
        name="estruturaLink"
        value={data.estruturaLink ?? ''}
        options={['Boa', 'Ruim / Necessário Ajustes']}
        onChange={(v) => onChange('estruturaLink', v)}
      />
      <RadioField
        label="Quantidade de tomadas na sala"
        name="tomadasQtd"
        value={data.tomadasQtd ?? ''}
        options={['Sem tomadas', 'De 1 a 2 tomadas', 'De 3 a 4 tomadas', 'Mais de 5 tomadas']}
        onChange={(v) => onChange('tomadasQtd', v)}
      />
      <RadioField
        label="Localização das tomadas"
        name="tomadasLocal"
        value={data.tomadasLocal ?? ''}
        options={['Próximos ao local ideal para equipamentos', 'Distantes, necessitando de fiação adicional']}
        onChange={(v) => onChange('tomadasLocal', v)}
      />
      <RadioField
        label="Acesso ao público nos finais de semana e feriado?"
        name="acessoPublico"
        value={data.acessoPublico ?? ''}
        options={SIM_NAO}
        onChange={(v) => onChange('acessoPublico', v)}
      />
      <RadioField
        label="Já houve incidentes de roubo/furto no local?"
        name="incidenteRoubo"
        value={data.incidenteRoubo ?? ''}
        options={SIM_NAO}
        onChange={(v) => onChange('incidenteRoubo', v)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <TextField label="Altura (teto ao chão)" value={data.alturaSala ?? ''} onChange={(v) => onChange('alturaSala', v)} />
        <TextField label="Largura" value={data.larguraSala ?? ''} onChange={(v) => onChange('larguraSala', v)} />
        <TextField
          label="Comprimento"
          value={data.comprimentoSala ?? ''}
          onChange={(v) => onChange('comprimentoSala', v)}
        />
      </div>

      <SectionTitle>Observações</SectionTitle>
      <TextAreaField label="Observações" value={data.obs ?? ''} onChange={(v) => onChange('obs', v)} />
    </>
  )
}
