export interface Perfil {
  nome: string
  descricao: string
  usuarios: number
}

export const PERFIS: Perfil[] = [
  { nome: 'Administrador', descricao: 'Acesso total ao sistema, incluindo administração e cadastros.', usuarios: 2 },
  { nome: 'Técnico de TI', descricao: 'Executa chamados, checklists de campo e documentos técnicos.', usuarios: 8 },
  { nome: 'Gestor de Projeto', descricao: 'Acompanha indicadores, aprova documentos e chamados do projeto.', usuarios: 5 },
  { nome: 'Atendente', descricao: 'Abre e acompanha chamados de assistência.', usuarios: 12 },
]

export type OrigemUsuario = 'LDAP' | 'Local'

export interface Usuario {
  nome: string
  email: string
  perfil: string
  origem: OrigemUsuario
  status: 'Ativo' | 'Inativo'
}

export const USUARIOS: Usuario[] = [
  { nome: 'Admin Vitae', email: 'admin@vitaebrasil.com.br', perfil: 'Administrador', origem: 'Local', status: 'Ativo' },
  { nome: 'Everton Pinheiro', email: 'everton.pinheiro@vitaebrasil.com.br', perfil: 'Administrador', origem: 'LDAP', status: 'Ativo' },
  { nome: 'Carla Menezes', email: 'carla.menezes@vitaebrasil.com.br', perfil: 'Gestor de Projeto', origem: 'LDAP', status: 'Ativo' },
  { nome: 'Rafael Souza', email: 'rafael.souza@vitaebrasil.com.br', perfil: 'Técnico de TI', origem: 'LDAP', status: 'Ativo' },
  { nome: 'Juliana Lima', email: 'juliana.lima@vitaebrasil.com.br', perfil: 'Atendente', origem: 'Local', status: 'Ativo' },
  { nome: 'Marcos Andrade', email: 'marcos.andrade@vitaebrasil.com.br', perfil: 'Técnico de TI', origem: 'LDAP', status: 'Inativo' },
]

export interface Grupo {
  nome: string
  descricao: string
  membros: number
}

export const GRUPOS: Grupo[] = [
  { nome: 'TIC — Suporte N1', descricao: 'Primeiro atendimento de chamados técnicos.', membros: 6 },
  { nome: 'TIC — Suporte N2', descricao: 'Chamados escalados e infraestrutura de rede.', membros: 3 },
  { nome: 'Gestores de Projeto', descricao: 'Aprovação de documentos e acompanhamento de indicadores.', membros: 5 },
  { nome: 'Central de Atendimento', descricao: 'Recepção de chamados via Vtcall e MKTZAP.', membros: 4 },
]

export interface Fornecedor {
  empresa: string
  servico: string
  contato: string
  telefone: string
}

export const FORNECEDORES: Fornecedor[] = [
  { empresa: 'Vtcall Telecom', servico: 'Central telefônica e discador', contato: 'suporte@vtcall.app', telefone: '(11) 4000-1234' },
  { empresa: 'MKTZAP Soluções', servico: 'Atendimento via WhatsApp', contato: 'contato@mktzap.com.br', telefone: '(11) 4000-5678' },
  { empresa: 'NetLink Provedor', servico: 'Link de internet dedicado', contato: 'noc@netlink.com.br', telefone: '(11) 4000-9012' },
  { empresa: 'TecPrint Suprimentos', servico: 'Toner e manutenção de impressoras', contato: 'vendas@tecprint.com.br', telefone: '(11) 4000-3456' },
]
