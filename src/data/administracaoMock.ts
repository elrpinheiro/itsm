export type ModuleKey = 'assistencia' | 'documentos' | 'baseConhecimento' | 'assinatura' | 'administracao' | 'ativos'

export const MODULE_KEYS: ModuleKey[] = ['assistencia', 'documentos', 'baseConhecimento', 'assinatura', 'administracao', 'ativos']

export const MODULE_LABELS: Record<ModuleKey, string> = {
  assistencia: 'Assistência (chamados)',
  documentos: 'Central de Documentos',
  baseConhecimento: 'Base de Conhecimento',
  assinatura: 'Assinatura Digital',
  administracao: 'Administração',
  ativos: 'Ativos',
}

/** Alcance de visualização de um módulo — "proprios" existe só para telas com dono (hoje: chamados). */
export type VisibilidadeAcesso = 'nenhum' | 'proprios' | 'todos'

export interface ModulePermission {
  ver: VisibilidadeAcesso
  criar: boolean
  editar: boolean
}

export type PermissionMatrix = Record<ModuleKey, ModulePermission>

function semAcesso(): ModulePermission {
  return { ver: 'nenhum', criar: false, editar: false }
}

function matrizCompleta(perm: ModulePermission): PermissionMatrix {
  return {
    assistencia: { ...perm },
    documentos: { ...perm },
    baseConhecimento: { ...perm },
    assinatura: { ...perm },
    administracao: { ...perm },
    ativos: { ...perm },
  }
}

export interface Perfil {
  id: string
  nome: string
  descricao: string
  /** Perfil de fábrica do sistema (como o Super-Admin do GLPI) — matriz fica travada para leitura na UI. */
  builtIn?: boolean
  permissoes: PermissionMatrix
}

/**
 * Perfis de acesso — cada um é uma matriz de permissões por módulo (ver: nenhum/próprios/todos,
 * criar, editar), no mesmo espírito da matriz de perfis do GLPI (Super-Admin, Admin, Technician,
 * Supervisor, Self-Service): https://help.glpi-project.org/documentation/modules/administration/profiles/profiles
 */
export const PERFIS: Perfil[] = [
  {
    id: 'super-admin',
    nome: 'Super Admin',
    descricao: 'Acesso total e irrestrito a todos os módulos — perfil de fábrica, não pode ser editado.',
    builtIn: true,
    permissoes: matrizCompleta({ ver: 'todos', criar: true, editar: true }),
  },
  {
    id: 'administrador',
    nome: 'Administrador',
    descricao: 'Acesso total ao sistema, incluindo administração e cadastros.',
    permissoes: matrizCompleta({ ver: 'todos', criar: true, editar: true }),
  },
  {
    id: 'tecnico-ti',
    nome: 'Técnico de TI',
    descricao: 'Executa chamados, checklists de campo e documentos técnicos.',
    permissoes: {
      assistencia: { ver: 'todos', criar: true, editar: true },
      documentos: { ver: 'todos', criar: true, editar: true },
      baseConhecimento: { ver: 'todos', criar: true, editar: false },
      assinatura: { ver: 'todos', criar: true, editar: true },
      ativos: { ver: 'todos', criar: true, editar: true },
      administracao: semAcesso(),
    },
  },
  {
    id: 'gestor-projeto',
    nome: 'Gestor de Projeto',
    descricao: 'Acompanha indicadores, aprova documentos e chamados do projeto.',
    permissoes: {
      assistencia: { ver: 'todos', criar: false, editar: true },
      documentos: { ver: 'todos', criar: false, editar: true },
      baseConhecimento: { ver: 'todos', criar: false, editar: false },
      assinatura: { ver: 'todos', criar: false, editar: false },
      ativos: { ver: 'todos', criar: false, editar: false },
      administracao: { ver: 'todos', criar: false, editar: false },
    },
  },
  {
    id: 'atendente',
    nome: 'Atendente',
    descricao: 'Abre e acompanha chamados de assistência.',
    permissoes: {
      assistencia: { ver: 'todos', criar: true, editar: true },
      documentos: semAcesso(),
      baseConhecimento: { ver: 'todos', criar: false, editar: false },
      assinatura: semAcesso(),
      ativos: semAcesso(),
      administracao: semAcesso(),
    },
  },
  {
    id: 'solicitante',
    nome: 'Solicitante',
    descricao: 'Abre chamados e acompanha apenas os próprios — perfil de autoatendimento.',
    permissoes: {
      assistencia: { ver: 'proprios', criar: true, editar: false },
      documentos: semAcesso(),
      baseConhecimento: { ver: 'todos', criar: false, editar: false },
      assinatura: semAcesso(),
      ativos: semAcesso(),
      administracao: semAcesso(),
    },
  },
]

export type OrigemUsuario = 'LDAP' | 'Local'

export interface Usuario {
  id: string
  nome: string
  email: string
  /** Nome de usuário para login — pode ser digitado no campo "Usuário" da tela de entrada, junto com o e-mail. */
  login: string
  /** Senha em texto plano — apenas para a simulação do MVP; nunca faça isso com senha real. */
  senha: string
  perfilId: string
  origem: OrigemUsuario
  status: 'Ativo' | 'Inativo'
}

export const USUARIOS: Usuario[] = [
  {
    id: 'admin-vitae',
    nome: 'Admin Vitae',
    email: 'admin@vitaebrasil.com.br',
    login: 'admin',
    senha: '12345678',
    perfilId: 'administrador',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'everton-pinheiro',
    nome: 'Everton Pinheiro',
    email: 'everton.pinheiro@vitaebrasil.com.br',
    login: 'everton.pinheiro',
    senha: '12345678',
    perfilId: 'super-admin',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'isadora-pinheiro',
    nome: 'Isadora Pinheiro',
    email: 'isadora.pinheiro@vitaebrasil.com.br',
    login: 'isadora.pinheiro',
    senha: '12345678',
    perfilId: 'solicitante',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'carla-menezes',
    nome: 'Carla Menezes',
    email: 'carla.menezes@vitaebrasil.com.br',
    login: 'carla.menezes',
    senha: '12345678',
    perfilId: 'gestor-projeto',
    origem: 'LDAP',
    status: 'Ativo',
  },
  {
    id: 'rafael-souza',
    nome: 'Rafael Souza',
    email: 'rafael.souza@vitaebrasil.com.br',
    login: 'rafael.souza',
    senha: '12345678',
    perfilId: 'tecnico-ti',
    origem: 'LDAP',
    status: 'Ativo',
  },
  {
    id: 'juliana-lima',
    nome: 'Juliana Lima',
    email: 'juliana.lima@vitaebrasil.com.br',
    login: 'juliana.lima',
    senha: '12345678',
    perfilId: 'atendente',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'marcos-andrade',
    nome: 'Marcos Andrade',
    email: 'marcos.andrade@vitaebrasil.com.br',
    login: 'marcos.andrade',
    senha: '12345678',
    perfilId: 'tecnico-ti',
    origem: 'LDAP',
    status: 'Inativo',
  },
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
