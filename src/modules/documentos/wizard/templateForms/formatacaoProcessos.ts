export interface FormatacaoProcesso {
  key: string
  processo: string
  detalhamento: string
}

/** Etapas fixas do Checklist para Formatação, na mesma ordem do formulário original da Faz Educação. */
export const FORMATACAO_PROCESSOS: FormatacaoProcesso[] = [
  {
    key: 'identificacao',
    processo: 'Identificação',
    detalhamento: 'Identificação/Cadastro de informações no inventário GLPI x OCS.',
  },
  {
    key: 'sistema_operacional',
    processo: 'Formatação e instalação do sistema operacional',
    detalhamento: 'Formatação e instalação do Sistema Operacional (com inclusão da chave/ativação).',
  },
  {
    key: 'drivers',
    processo: 'Drivers',
    detalhamento: 'Instalação e/ou atualização de todos os drivers.',
  },
  {
    key: 'usuarios',
    processo: 'Configuração de usuários',
    detalhamento: 'Ativar e definir uma senha para o Usuário Administrador e Usuário (Perfil sem Privilégios).',
  },
  {
    key: 'softwares',
    processo: 'Softwares',
    detalhamento: 'Instalação e ativação dos softwares solicitados.',
  },
  {
    key: 'wallpaper',
    processo: 'Wallpaper',
    detalhamento: 'Aplicar Wallpaper / Restrições de impedimento de alteração no Regedit/Gpedit.',
  },
  {
    key: 'teste_software',
    processo: 'Teste de Software',
    detalhamento: 'Testar todos os softwares de mais uso: Word, Excel, PowerPoint etc.',
  },
  {
    key: 'teste_hardware',
    processo: 'Testes de Hardware',
    detalhamento: 'Realizar testes de hardware (teste de áudio, vídeo, internet cabeada e Wi-Fi).',
  },
  {
    key: 'limpeza',
    processo: 'Limpeza',
    detalhamento: 'Limpeza física do equipamento.',
  },
]

export const FORMATACAO_SOFTWARES: string[] = [
  'Microsoft Office 365 (Versão Standard)',
  'Adobe Acrobat Reader',
  'WinRar / 7-Zip',
  'Teams',
  'VLC',
  'Anydesk Corporativo',
  'Antivírus Acronis',
  'Navegadores (Chrome e Edge)',
  'Agent OCS',
]
