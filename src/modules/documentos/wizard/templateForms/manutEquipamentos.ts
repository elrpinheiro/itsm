export interface EquipamentoSpec {
  key: string
  label: string
  estadoOptions: string[]
  motivoOptions: string[]
  coluna: 'infra' | 'oper'
}

/**
 * Itens de checklist do Relatório de Manutenção Preventiva (FO-TIC-SD-0001),
 * replicando exatamente os equipamentos e opções de "Motivo (se ruim)" do
 * formulário original. formData usa a chave `${key}_estado` e multiData usa
 * `${key}_motivo`.
 */
export const MANUT_EQUIPAMENTOS: EquipamentoSpec[] = [
  {
    key: 'unifi',
    label: 'Unifi',
    estadoOptions: ['Bom', 'Ruim'],
    motivoOptions: ['Lentidão/oscilação', 'Indisponibilidade total'],
    coluna: 'infra',
  },
  {
    key: 'mikrotik',
    label: 'Mikrotik',
    estadoOptions: ['Bom', 'Ruim'],
    motivoOptions: ['Lentidão/oscilação', 'Indisponibilidade total'],
    coluna: 'infra',
  },
  {
    key: 'link',
    label: 'Link de internet',
    estadoOptions: ['Não há link no local.', 'Bom', 'Ruim'],
    motivoOptions: ['Lentidão/oscilação', 'Indisponibilidade total'],
    coluna: 'infra',
  },
  {
    key: 'impressoras',
    label: 'Impressoras',
    estadoOptions: ['Bom', 'Ruim'],
    motivoOptions: ['Avarias físicas', 'Problema nos toners', 'Sujeira excessiva'],
    coluna: 'infra',
  },
  {
    key: 'gabinete',
    label: 'Gabinete de carga',
    estadoOptions: ['Bom', 'Ruim'],
    motivoOptions: ['Avarias físicas', 'Problemas no Cooler', 'Superaquecimento', 'Sujeira excessiva', 'Itens faltando'],
    coluna: 'oper',
  },
  {
    key: 'ipads',
    label: 'Ipads/Notebooks',
    estadoOptions: ['Bom', 'Ruim'],
    motivoOptions: ['Avarias físicas', 'Superaquecimento', 'Sujeira excessiva'],
    coluna: 'oper',
  },
  {
    key: 'smarttv',
    label: 'Smart TV/Apple TV/Chromecast',
    estadoOptions: ['Bom', 'Ruim'],
    motivoOptions: ['Avarias físicas', 'Superaquecimento', 'Sujeira excessiva'],
    coluna: 'oper',
  },
]
