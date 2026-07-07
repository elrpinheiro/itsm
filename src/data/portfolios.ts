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
    nome: 'Entrega de Equipamentos',
    icon: '📦',
    bg: '#EAF3DE',
    desc: 'Termos de responsabilidade e recibos de entrega de equipamentos e materiais.',
    templateIds: ['termo', 'recibo'],
  },
  {
    id: 'homolog',
    nome: 'Homologação & Especificações',
    icon: '✅',
    bg: '#FAEEDA',
    desc: 'Checklists de conformidade de especificações para homologação de itens e lotes.',
    templateIds: ['homolog'],
  },
]
