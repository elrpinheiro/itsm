import type { TemplateDef } from '@/types'

export const TEMPLATES: TemplateDef[] = [
  {
    id: 'manut',
    code: 'FO-TIC-SD-0001',
    nome: 'Relatório de Manutenção Preventiva',
    icon: '🛠',
    iconBg: '#E6F1FB',
    signers: [{ cargo: 'Visitado por' }, { cargo: 'Responsável do local' }],
  },
  {
    id: 'checklist',
    code: 'FO-TIC-SD-0003',
    nome: 'Checklist de Visita Técnica',
    icon: '📋',
    iconBg: '#EAF3DE',
    signers: [{ cargo: 'Visitado por' }, { cargo: 'Responsável pela Escola' }],
  },
  {
    id: 'termo',
    code: 'FO-TIC-SD-0008',
    nome: 'Termo de Entrega de Equipamentos',
    icon: '💻',
    iconBg: '#FAEEDA',
    signers: [{ cargo: 'Técnico Responsável' }, { cargo: 'Colaborador' }],
  },
  {
    id: 'homolog',
    code: 'FO-TIC-SD-0010',
    nome: 'Checklist de Especificações — Homologação',
    icon: '✅',
    iconBg: '#FCEBEB',
    signers: [{ cargo: 'Homologado por' }, { cargo: 'Aprovado por' }],
  },
  {
    id: 'recibo',
    code: 'REC-ENTREGA',
    nome: 'Recibo de Entrega',
    icon: '📦',
    iconBg: '#EEEDFE',
    signers: [{ cargo: 'Responsável pela entrega' }, { cargo: 'Responsável pelo recebimento' }],
  },
  {
    id: 'devolucao',
    code: 'FO-TIC-SD-0009',
    nome: 'Termo de Devolução de Equipamentos de TI',
    icon: '↩️',
    iconBg: '#FDEAEA',
    signers: [{ cargo: 'Técnico Responsável' }, { cargo: 'Colaborador' }],
  },
  {
    id: 'usb',
    code: 'FO-TIC-SD-0002',
    nome: 'Termo de Liberação de USB',
    icon: '🔌',
    iconBg: '#EAF0FD',
    signers: [{ cargo: 'Técnico Responsável' }, { cargo: 'Gerente Responsável' }, { cargo: 'Colaborador' }],
  },
  {
    id: 'formatacao',
    code: 'CHK-FORMATACAO',
    nome: 'Checklist para Formatação',
    icon: '🖥',
    iconBg: '#FDF3D9',
    signers: [{ cargo: 'Operador' }, { cargo: 'ServiceDelivery' }],
  },
  {
    id: 'mobilizacao',
    code: 'FO-TIC-SD-0004',
    nome: 'Checklist de Mobilização',
    icon: '🚀',
    iconBg: '#E3F5F0',
    signers: [{ cargo: 'Visitado por' }],
  },
  {
    id: 'gmud',
    code: 'GMUD',
    nome: 'Gestão de Mudanças — TIC',
    icon: '🔄',
    iconBg: '#E8ECFB',
    signers: [{ cargo: 'Responsável pela execução' }, { cargo: 'Aprovador da mudança' }],
  },
]

export function getTemplateById(id: string) {
  return TEMPLATES.find((t) => t.id === id)
}
