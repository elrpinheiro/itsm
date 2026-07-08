export interface MobilizacaoGrupo {
  key: string
  label: string
  itens: string[]
}

/** Coluna "Configuração de equipamentos" do Checklist de Mobilização (FO-TIC-SD-0004). */
export const MOBILIZACAO_CONFIGURACAO: MobilizacaoGrupo[] = [
  {
    key: 'ipads',
    label: 'iPads',
    itens: [
      'Recebimento e configuração inicial iPads',
      'Deploy de aplicativos/perfis de configuração',
      'Gravação a laser de patrimônio',
      'Inserção de capa bumper',
    ],
  },
  {
    key: 'notebooks',
    label: 'Notebooks',
    itens: [
      'Instalação de aplicativos',
      'Criação de usuário',
      'Inserção de regras/Políticas',
      'Instalação de Antivírus',
      'Instalação de Anydesk',
    ],
  },
  {
    key: 'mikrotik',
    label: 'Mikrotik',
    itens: ['Configuração de rede local'],
  },
  {
    key: 'unifi',
    label: 'Unifi',
    itens: ['Criação de novo sítio', 'Adoção de antena em sítio', 'Configuração/otimização de antena'],
  },
  {
    key: 'appletv',
    label: 'Apple TV',
    itens: ['Configuração inicial Apple TV', 'Atualização Apple TV'],
  },
  {
    key: 'gabinete',
    label: 'Gabinete de recarga',
    itens: ['Instalação de equipamentos', 'Organização de carregadores'],
  },
]

/** Coluna "Instalação física de equipamentos" — lista plana, sem subgrupos. */
export const MOBILIZACAO_INSTALACAO_FISICA: string[] = [
  'Suporte para TV',
  'Configuração inicial TV Smart',
  'Instalação de antena Unifi',
  'Instalação de roteador Mikrotik',
  'Instalação de Apple TV em Smart TV',
  'Organização da sala',
]
