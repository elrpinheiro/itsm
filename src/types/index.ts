/** Identificador de marca — os 3 valores originais continuam existindo, mas o admin pode cadastrar novas em tempo de execução, por isso o tipo é aberto. */
export type BrandId = string

export interface Brand {
  id: BrandId
  nome: string
  razaoSocial: string
  cor: string
  /** Classe CSS fixa (badge-blue/green/purple) usada pelas marcas originais; marcas criadas pelo admin não têm classe pré-definida e usam estilo inline derivado de `cor`. */
  badgeClass?: 'badge-blue' | 'badge-green' | 'badge-purple'
  logo: string
}

export type TemplateId =
  | 'manut'
  | 'checklist'
  | 'termo'
  | 'homolog'
  | 'recibo'
  | 'gmud'
  | 'formatacao'
  | 'mobilizacao'
  | 'devolucao'
  | 'usb'

export interface Portfolio {
  id: string
  nome: string
  icon: string
  bg: string
  desc: string
  templateIds: TemplateId[]
}

export interface SignerTemplate {
  cargo: string
}

export interface TemplateDef {
  id: TemplateId
  code: string
  nome: string
  icon: string
  iconBg: string
  signers: SignerTemplate[]
}

export interface Signer {
  id: number
  nome: string
  cargo: string
  cpf: string
  email: string
  x: number
  y: number
  signed: boolean
}

export type ChecklistAvaliacao = 'nao_atende' | 'atencao' | 'atende'

export interface ChecklistItem {
  descricao: string
  /** Especificação do item de referência escolhido, para comparar lado a lado com o edital. */
  referencia?: string
  /** Avaliação do item de referência frente à especificação do edital. */
  avaliacao?: ChecklistAvaliacao
}

/** Uma linha de equipamento nos termos de entrega/devolução (permite múltiplos itens por documento). */
export interface EquipmentItem {
  descricao: string
  patrimonio: string
}

/** Dados de formulário livres, indexados por chave de campo do template ativo. */
export type DocumentFormData = Record<string, string>

export type WizardStep = 1 | 2 | 3 | 4

/** Organização mantenedora de um projeto — mesmo conjunto de marcas usado nos documentos (BrandId). */
export type ProjectBrandId = BrandId

export interface ProjectTheme {
  label: string
  logo: string
  escuro: string
  medio: string
  pale: string
  texto: string
  accento: string
}

/** Um projeto/entidade selecionável na tela pós-login (ex.: "Caçapava — Escola do Futuro"). */
export interface Project {
  id: string
  cidade: string
  nome: string
  brandId: ProjectBrandId
  logo: string
  /** Verdadeiro para a matriz/sede da empresa (sem cidade de campo) — cada empresa do grupo tem exatamente uma, e ela também pode abrir chamados/ter seu próprio catálogo de atendimento. */
  isMatriz?: boolean
}
