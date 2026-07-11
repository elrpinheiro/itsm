export interface Computador {
  patrimonio: string
  modelo: string
  usuario: string
  projeto: string
  status: 'Em uso' | 'Em estoque' | 'Manutenção'
}

export const COMPUTADORES: Computador[] = [
  { patrimonio: 'VT-NB-0231', modelo: 'Notebook Dell Vostro 3520', usuario: 'Rafael Souza', projeto: 'ConectaOZ — Osasco', status: 'Em uso' },
  { patrimonio: 'VT-DT-0118', modelo: 'Desktop Positivo Master', usuario: 'Secretaria', projeto: 'Escola do Futuro — Caçapava', status: 'Em uso' },
  { patrimonio: 'VT-NB-0245', modelo: 'Notebook Lenovo V14', usuario: '—', projeto: 'Estoque central', status: 'Em estoque' },
  { patrimonio: 'VT-DT-0099', modelo: 'Desktop Dell OptiPlex 3080', usuario: 'Laboratório 2', projeto: 'Eu Tenho Futuro — Osasco', status: 'Manutenção' },
]

export interface DispositivoRede {
  patrimonio: string
  tipo: 'Switch' | 'Roteador' | 'Access Point'
  modelo: string
  local: string
  status: 'Ativo' | 'Inativo'
}

export const DISPOSITIVOS_REDE: DispositivoRede[] = [
  { patrimonio: 'VT-SW-0012', tipo: 'Switch', modelo: 'TP-Link TL-SG1024', local: 'Rack principal — Caçapava', status: 'Ativo' },
  { patrimonio: 'VT-RT-0007', tipo: 'Roteador', modelo: 'Mikrotik hAP ac2', local: 'Sala de TI — Porto Feliz', status: 'Ativo' },
  { patrimonio: 'VT-AP-0033', tipo: 'Access Point', modelo: 'Ubiquiti UniFi AP AC Lite', local: 'Corredor — Cerquilho', status: 'Inativo' },
]

export interface Monitor {
  patrimonio: string
  modelo: string
  usuario: string
  projeto: string
  status: 'Em uso' | 'Em estoque' | 'Manutenção'
}

export const MONITORES: Monitor[] = [
  { patrimonio: 'VT-MN-0301', modelo: 'LG 21.5" Full HD', usuario: 'Secretaria', projeto: 'EducaTaboão — Taboão da Serra', status: 'Em uso' },
  { patrimonio: 'VT-MN-0287', modelo: 'Samsung 24" Full HD', usuario: '—', projeto: 'Aedifica — São Paulo', status: 'Manutenção' },
  { patrimonio: 'VT-MN-0350', modelo: 'AOC 21.5" Full HD', usuario: '—', projeto: 'Estoque central', status: 'Em estoque' },
]

export interface SoftwareLicenca {
  software: string
  tipoLicenca: string
  quantidade: number
  vencimento: string
}

export const SOFTWARES: SoftwareLicenca[] = [
  { software: 'Microsoft 365 Business', tipoLicenca: 'Assinatura anual', quantidade: 25, vencimento: '15/03/2027' },
  { software: 'Windows 11 Pro', tipoLicenca: 'OEM/Volume', quantidade: 40, vencimento: 'Perpétua' },
  { software: 'Antivírus Kaspersky Endpoint', tipoLicenca: 'Assinatura anual', quantidade: 40, vencimento: '02/11/2026' },
  { software: 'Adobe Acrobat Pro', tipoLicenca: 'Assinatura mensal', quantidade: 3, vencimento: '01/08/2026' },
]

export interface Periferico {
  patrimonio: string
  item: string
  usuario: string
  projeto: string
}

export const PERIFERICOS: Periferico[] = [
  { patrimonio: 'VT-PR-0511', item: 'Teclado USB', usuario: 'Secretaria', projeto: 'Escola do Futuro — Caçapava' },
  { patrimonio: 'VT-PR-0522', item: 'Mouse óptico', usuario: 'Rafael Souza', projeto: 'ConectaOZ — Osasco' },
  { patrimonio: 'VT-PR-0533', item: 'Webcam Full HD', usuario: 'Sala de reuniões', projeto: 'Aedifica — São Paulo' },
]

export interface Impressora {
  patrimonio: string
  modelo: string
  local: string
  contador: string
  status: 'Em uso' | 'Manutenção' | 'Sem suprimento'
}

export const IMPRESSORAS: Impressora[] = [
  { patrimonio: 'VT-IM-0021', modelo: 'HP LaserJet Pro M404dn', local: 'Secretaria — Caçapava', contador: '48.230 págs.', status: 'Em uso' },
  { patrimonio: 'VT-IM-0034', modelo: 'Epson EcoTank L3250', local: 'Recepção — Porto Feliz', contador: '12.410 págs.', status: 'Sem suprimento' },
  { patrimonio: 'VT-IM-0018', modelo: 'Brother DCP-L2540DW', local: 'Sala de TI — Osasco', contador: '61.900 págs.', status: 'Manutenção' },
]

export interface Telefone {
  numero: string
  modelo: string
  usuario: string
  projeto: string
}

export const TELEFONES: Telefone[] = [
  { numero: 'Ramal 1042', modelo: 'IP Phone Grandstream GXP1625', usuario: 'Secretaria', projeto: 'Escola do Futuro — Caçapava' },
  { numero: 'Ramal 1015', modelo: 'IP Phone Grandstream GXP1625', usuario: 'Recepção', projeto: 'ConectaOZ — Osasco' },
  { numero: '(11) 98888-1234', modelo: 'Smartphone corporativo', usuario: 'Rafael Souza', projeto: 'Central Vitae Brasil' },
]

export interface AtivoVinculavel {
  patrimonio: string
  label: string
  tipo: string
}

/** Lista única de patrimônios do módulo Ativos, usada para vincular itens a um chamado (Assistência).
 * Licenças de software ficam de fora por não terem um patrimônio individual rastreável. */
export const ATIVOS_VINCULAVEIS: AtivoVinculavel[] = [
  ...COMPUTADORES.map((c) => ({ patrimonio: c.patrimonio, label: c.modelo, tipo: 'Computador' })),
  ...DISPOSITIVOS_REDE.map((d) => ({ patrimonio: d.patrimonio, label: `${d.tipo} — ${d.modelo}`, tipo: 'Rede' })),
  ...MONITORES.map((m) => ({ patrimonio: m.patrimonio, label: m.modelo, tipo: 'Monitor' })),
  ...PERIFERICOS.map((p) => ({ patrimonio: p.patrimonio, label: p.item, tipo: 'Periférico' })),
  ...IMPRESSORAS.map((i) => ({ patrimonio: i.patrimonio, label: i.modelo, tipo: 'Impressora' })),
  ...TELEFONES.map((t) => ({ patrimonio: t.numero, label: t.modelo, tipo: 'Telefone' })),
]
