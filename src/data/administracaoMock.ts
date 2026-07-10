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
  /**
   * Entidade (projeto) dona deste perfil — os 8 perfis de fábrica não têm (ficam disponíveis para
   * todos os projetos, como no GLPI); um perfil customizado pode nascer restrito a um projeto, como
   * se cada unidade tivesse sua própria camada de configuração de acesso.
   */
  projetoId?: string
  permissoes: PermissionMatrix
}

/**
 * Os 8 perfis padrão de uma instalação GLPI, copiados com a mesma intenção de cada um (Super-Admin,
 * Admin, Supervisor, Technician, Hotliner, Observer, Read-Only, Self-Service), com a matriz de
 * permissões traduzida para os módulos deste ITSM: https://help.glpi-project.org/documentation/modules/administration/profiles/profiles
 */
export const PERFIS: Perfil[] = [
  {
    id: 'super-admin',
    nome: 'Super-Admin',
    descricao: 'Recebe todas as permissões — perfil de fábrica, não pode ser editado ou excluído.',
    builtIn: true,
    permissoes: matrizCompleta({ ver: 'todos', criar: true, editar: true }),
  },
  {
    id: 'admin',
    nome: 'Admin',
    descricao: 'Direitos de administração para todo o sistema.',
    permissoes: matrizCompleta({ ver: 'todos', criar: true, editar: true }),
  },
  {
    id: 'supervisor',
    nome: 'Supervisor',
    descricao: 'Incorpora o perfil Technician, somando gestão de equipe e alocação de chamados.',
    permissoes: {
      assistencia: { ver: 'todos', criar: true, editar: true },
      documentos: { ver: 'todos', criar: true, editar: true },
      baseConhecimento: { ver: 'todos', criar: true, editar: true },
      assinatura: { ver: 'todos', criar: true, editar: true },
      ativos: { ver: 'todos', criar: true, editar: true },
      administracao: { ver: 'todos', criar: false, editar: false },
    },
  },
  {
    id: 'technician',
    nome: 'Technician',
    descricao: 'Acesso de leitura ao inventário e ao helpdesk para processar chamados.',
    permissoes: {
      assistencia: { ver: 'todos', criar: true, editar: true },
      documentos: { ver: 'todos', criar: true, editar: true },
      baseConhecimento: { ver: 'todos', criar: true, editar: false },
      assinatura: { ver: 'todos', criar: true, editar: true },
      ativos: { ver: 'todos', criar: false, editar: false },
      administracao: semAcesso(),
    },
  },
  {
    id: 'hotliner',
    nome: 'Hotliner',
    descricao: 'Abre chamados e os acompanha, mas não é responsável por eles como um Technician.',
    permissoes: {
      assistencia: { ver: 'todos', criar: true, editar: false },
      documentos: semAcesso(),
      baseConhecimento: { ver: 'todos', criar: false, editar: false },
      assinatura: semAcesso(),
      ativos: semAcesso(),
      administracao: semAcesso(),
    },
  },
  {
    id: 'observer',
    nome: 'Observer',
    descricao: 'Leitura de todos os dados de inventário e gestão; pode abrir/ser designado a um chamado, mas não administra.',
    permissoes: {
      assistencia: { ver: 'todos', criar: true, editar: false },
      documentos: { ver: 'todos', criar: false, editar: false },
      baseConhecimento: { ver: 'todos', criar: false, editar: false },
      assinatura: { ver: 'todos', criar: false, editar: false },
      ativos: { ver: 'todos', criar: false, editar: false },
      administracao: { ver: 'todos', criar: false, editar: false },
    },
  },
  {
    id: 'read-only',
    nome: 'Read-Only',
    descricao: 'Apenas leitura em todos os módulos que tiver acesso — não abre nem edita nada.',
    permissoes: {
      assistencia: { ver: 'todos', criar: false, editar: false },
      documentos: { ver: 'todos', criar: false, editar: false },
      baseConhecimento: { ver: 'todos', criar: false, editar: false },
      assinatura: { ver: 'todos', criar: false, editar: false },
      ativos: { ver: 'todos', criar: false, editar: false },
      administracao: semAcesso(),
    },
  },
  {
    id: 'self-service',
    nome: 'Self-Service',
    descricao: 'O mais limitado: declara um chamado, acompanha e consulta a FAQ/Base de Conhecimento.',
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

/** Categoria organizacional do usuário — equivalente ao campo "Category" do GLPI (independente do Perfil,
 * que é sobre permissão; Categoria é sobre função/área na instituição). */
export const CATEGORIAS_USUARIO = ['Direção', 'Coordenação Pedagógica', 'Secretaria', 'TI', 'Professor', 'Outro'] as const
export type CategoriaUsuario = (typeof CATEGORIAS_USUARIO)[number]

/**
 * Estrutura alinhada ao formulário "Adicionar um usuário" do GLPI (Surname/Firstname, Phone, Mobile
 * phone, Title, Category, Location, Default profile, Default entity/group, Supervisor, Authentication):
 * https://help.glpi-project.org/documentation/modules/administration/users/users
 * Campos que o GLPI tem e não fazem sentido aqui (fuso horário, múltiplos e-mails, token de API,
 * validade da conta) foram deixados de fora — ver seção 05.10 da documentação técnica.
 */
export interface Usuario {
  id: string
  /** Firstname do GLPI. */
  primeiroNome: string
  /** Surname do GLPI. */
  sobrenome: string
  /** Nome completo, calculado uma vez na criação (primeiroNome + sobrenome) — usado em todo o resto do app. */
  nome: string
  email: string
  /** Nome de usuário para login — pode ser digitado no campo "Usuário" da tela de entrada, junto com o e-mail. */
  login: string
  /** Senha em texto plano — apenas para a simulação do MVP; nunca faça isso com senha real. */
  senha: string
  telefone?: string
  celular?: string
  /** Title do GLPI — cargo/função formal (ex.: "Coordenador Pedagógico"). */
  cargo?: string
  categoria?: CategoriaUsuario
  /** Location do GLPI — aqui mapeada para a unidade/projeto do grupo (Localização). */
  projetoId?: string
  /** Default profile do GLPI. */
  perfilId: string
  /**
   * Grupos do GLPI — um usuário pode pertencer a vários grupos (aba "Groups" do usuário /
   * aba "Users" do grupo, no GLPI real). Simplificado aqui: só a lista de pertencimento, sem
   * as flags de "gerente"/"delegado" que o GLPI tem por vínculo usuário-grupo.
   */
  grupoIds?: string[]
  /** Supervisor do GLPI — outro usuário do sistema. */
  supervisorId?: string
  /** Authentication do GLPI (Local ou LDAP). */
  origem: OrigemUsuario
  comentarios?: string
  status: 'Ativo' | 'Inativo'
}

export const USUARIOS: Usuario[] = [
  {
    id: 'admin-vitae',
    primeiroNome: 'Admin',
    sobrenome: 'Vitae',
    nome: 'Admin Vitae',
    email: 'admin@vitaebrasil.com.br',
    login: 'admin',
    senha: '12345678',
    cargo: 'Administrador de Sistema',
    categoria: 'TI',
    perfilId: 'admin',
    origem: 'Local',
    comentarios: 'Conta padrão do sistema.',
    status: 'Ativo',
  },
  {
    id: 'everton-pinheiro',
    primeiroNome: 'Everton',
    sobrenome: 'Pinheiro',
    nome: 'Everton Pinheiro',
    email: 'everton.pinheiro@vitaebrasil.com.br',
    login: 'everton.pinheiro',
    senha: '12345678',
    telefone: '(11) 4000-0001',
    celular: '(11) 99999-0001',
    cargo: 'Diretor de Tecnologia',
    categoria: 'TI',
    perfilId: 'super-admin',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'isadora-pinheiro',
    primeiroNome: 'Isadora',
    sobrenome: 'Pinheiro',
    nome: 'Isadora Pinheiro',
    email: 'isadora.pinheiro@vitaebrasil.com.br',
    login: 'isadora.pinheiro',
    senha: '12345678',
    cargo: 'Secretária Escolar',
    categoria: 'Secretaria',
    projetoId: 'serra-negra-infancia-conectada',
    perfilId: 'self-service',
    supervisorId: 'carla-menezes',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'carla-menezes',
    primeiroNome: 'Carla',
    sobrenome: 'Menezes',
    nome: 'Carla Menezes',
    email: 'carla.menezes@vitaebrasil.com.br',
    login: 'carla.menezes',
    senha: '12345678',
    cargo: 'Gestora de Projeto',
    categoria: 'Coordenação Pedagógica',
    grupoIds: ['grp-gestores'],
    perfilId: 'supervisor',
    origem: 'LDAP',
    status: 'Ativo',
  },
  {
    id: 'rafael-souza',
    primeiroNome: 'Rafael',
    sobrenome: 'Souza',
    nome: 'Rafael Souza',
    email: 'rafael.souza@vitaebrasil.com.br',
    login: 'rafael.souza',
    senha: '12345678',
    cargo: 'Técnico de Suporte',
    categoria: 'TI',
    grupoIds: ['grp-n1'],
    supervisorId: 'everton-pinheiro',
    perfilId: 'technician',
    origem: 'LDAP',
    status: 'Ativo',
  },
  {
    id: 'juliana-lima',
    primeiroNome: 'Juliana',
    sobrenome: 'Lima',
    nome: 'Juliana Lima',
    email: 'juliana.lima@vitaebrasil.com.br',
    login: 'juliana.lima',
    senha: '12345678',
    cargo: 'Atendente',
    categoria: 'TI',
    grupoIds: ['grp-central-atendimento'],
    supervisorId: 'carla-menezes',
    perfilId: 'hotliner',
    origem: 'Local',
    status: 'Ativo',
  },
  {
    id: 'marcos-andrade',
    primeiroNome: 'Marcos',
    sobrenome: 'Andrade',
    nome: 'Marcos Andrade',
    email: 'marcos.andrade@vitaebrasil.com.br',
    login: 'marcos.andrade',
    senha: '12345678',
    cargo: 'Técnico de Suporte',
    categoria: 'TI',
    grupoIds: ['grp-n2'],
    supervisorId: 'everton-pinheiro',
    perfilId: 'technician',
    origem: 'LDAP',
    status: 'Inativo',
  },
]

/**
 * Estrutura alinhada à aba "Adicionar um grupo" do GLPI — flags de comportamento no chamado
 * (visível como solicitante, visível para atribuição, pode ser notificado) e vínculo com uma
 * entidade (projeto): https://help.glpi-project.org/documentation/modules/administration/groups
 * O nº de membros não é mais um campo fixo — é calculado a partir de quem tem este grupo em Usuario.grupoIds.
 *
 * No GLPI, um grupo pertence a uma entidade e pode ser "recursivo" (visível também nas entidades
 * filhas). Como este sistema não tem hierarquia de entidades — projetos são todos do mesmo nível —,
 * só existe o vínculo direto (`projetoId`); não há flag de recursividade.
 */
export interface Grupo {
  id: string
  nome: string
  descricao: string
  /** Entidade (projeto) do grupo — funciona como um departamento daquela unidade. Sem valor = grupo global/matriz. */
  projetoId?: string
  visivelComoSolicitante: boolean
  visivelComoAtribuicao: boolean
  podeSerNotificado: boolean
}

export const GRUPOS: Grupo[] = [
  {
    id: 'grp-n1',
    nome: 'TIC — Suporte N1',
    descricao: 'Primeiro atendimento de chamados técnicos.',
    visivelComoSolicitante: false,
    visivelComoAtribuicao: true,
    podeSerNotificado: true,
  },
  {
    id: 'grp-n2',
    nome: 'TIC — Suporte N2',
    descricao: 'Chamados escalados e infraestrutura de rede.',
    visivelComoSolicitante: false,
    visivelComoAtribuicao: true,
    podeSerNotificado: true,
  },
  {
    id: 'grp-gestores',
    nome: 'Gestores de Projeto',
    descricao: 'Aprovação de documentos e acompanhamento de indicadores.',
    visivelComoSolicitante: false,
    visivelComoAtribuicao: false,
    podeSerNotificado: true,
  },
  {
    id: 'grp-central-atendimento',
    nome: 'Central de Atendimento',
    descricao: 'Recepção de chamados via Vtcall e MKTZAP.',
    visivelComoSolicitante: true,
    visivelComoAtribuicao: true,
    podeSerNotificado: true,
  },
  {
    id: 'grp-tic-osasco-eu-tenho-futuro',
    nome: 'TIC',
    descricao: 'Departamento de suporte técnico de TI da unidade.',
    projetoId: 'osasco-eu-tenho-futuro',
    visivelComoSolicitante: false,
    visivelComoAtribuicao: true,
    podeSerNotificado: true,
  },
]

/** Tipo de terceiro do fornecedor — equivalente ao "type of third party" do GLPI. */
export const TIPOS_FORNECEDOR = ['Fabricante', 'Prestador de Serviço', 'Revenda', 'Transportadora', 'Outro'] as const
export type TipoFornecedor = (typeof TIPOS_FORNECEDOR)[number]

/**
 * Estrutura alinhada ao cadastro de "Fournisseurs" do GLPI: nome, tipo de terceiro, localização
 * (endereço/cidade) e contato (site, telefone, e-mail) — sem as abas de contratos/orçamento, que
 * não existem neste MVP: https://help.glpi-project.org/documentation/fr/modules/management/suppliers
 */
export interface Fornecedor {
  id: string
  empresa: string
  tipo: TipoFornecedor
  servico: string
  email: string
  telefone: string
  site?: string
  endereco?: string
  cidade?: string
  estado?: string
  comentarios?: string
  /** Entidade (projeto) — GLPI também trata fornecedor como um cadastro por entidade; sem entidade = fornecedor global, usado por qualquer projeto. */
  projetoId?: string
}

export const FORNECEDORES: Fornecedor[] = [
  {
    id: 'forn-vtcall',
    empresa: 'Vtcall Telecom',
    tipo: 'Prestador de Serviço',
    servico: 'Central telefônica e discador',
    email: 'suporte@vtcall.app',
    telefone: '(11) 4000-1234',
    site: 'https://vtcall.app',
    cidade: 'São Paulo',
    estado: 'SP',
  },
  {
    id: 'forn-mktzap',
    empresa: 'MKTZAP Soluções',
    tipo: 'Prestador de Serviço',
    servico: 'Atendimento via WhatsApp',
    email: 'contato@mktzap.com.br',
    telefone: '(11) 4000-5678',
    site: 'https://mktzap.com.br',
    cidade: 'São Paulo',
    estado: 'SP',
  },
  {
    id: 'forn-netlink',
    empresa: 'NetLink Provedor',
    tipo: 'Prestador de Serviço',
    servico: 'Link de internet dedicado',
    email: 'noc@netlink.com.br',
    telefone: '(11) 4000-9012',
    cidade: 'Osasco',
    estado: 'SP',
    projetoId: 'osasco-eu-tenho-futuro',
  },
  {
    id: 'forn-tecprint',
    empresa: 'TecPrint Suprimentos',
    tipo: 'Revenda',
    servico: 'Toner e manutenção de impressoras',
    email: 'vendas@tecprint.com.br',
    telefone: '(11) 4000-3456',
    cidade: 'São Paulo',
    estado: 'SP',
  },
]
