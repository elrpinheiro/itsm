import type { Portfolio } from '@/types'

export const PORTFOLIOS: Portfolio[] = [
  {
    id: 'manut',
    nome: 'Manutenção & Visita Técnica',
    icon: '🔧',
    bg: '#E6F1FB',
    desc: 'Relatórios de manutenção preventiva e checklists de visita técnica em unidades escolares.',
    templateIds: ['manut', 'checklist'],
  },
  {
    id: 'entrega',
    nome: 'Entrega & Devolução de Equipamentos',
    icon: '📦',
    bg: '#EAF3DE',
    desc: 'Termos de responsabilidade, recibos, devolução e liberação de uso de equipamentos e materiais.',
    templateIds: ['termo', 'recibo', 'devolucao', 'usb'],
  },
  {
    id: 'implantacao',
    nome: 'Implantação & Configuração',
    icon: '🚀',
    bg: '#E3F5F0',
    desc: 'Checklists de formatação, configuração e mobilização de equipamentos em novos projetos.',
    templateIds: ['formatacao', 'mobilizacao'],
  },
  {
    id: 'homolog',
    nome: 'Homologação & Especificações',
    icon: '✅',
    bg: '#FAEEDA',
    desc: 'Checklists de conformidade de especificações para homologação de itens e lotes.',
    templateIds: ['homolog'],
  },
  {
    id: 'mudancas',
    nome: 'Habilitação de Mudanças',
    icon: '🔄',
    bg: '#E8ECFB',
    desc: 'Controle de mudanças de TIC: janela de execução, etapas de rollback e escopo da mudança.',
    templateIds: ['gmud'],
  },
]
