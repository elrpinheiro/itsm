export type BrandId = 'planneta' | 'faz'

export interface Brand {
  id: BrandId
  nome: string
  razaoSocial: string
  cor: string
  badgeClass: 'badge-blue' | 'badge-green'
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

export interface ChecklistItem {
  descricao: string
}

/** Uma linha de equipamento nos termos de entrega/devolução (permite múltiplos itens por documento). */
export interface EquipmentItem {
  descricao: string
  patrimonio: string
}

/** Dados de formulário livres, indexados por chave de campo do template ativo. */
export type DocumentFormData = Record<string, string>

export type WizardStep = 1 | 2 | 3 | 4

/** Organização mantenedora de um projeto — usada só para tematizar o shell, independente das marcas de documento (BrandId). */
export type ProjectBrandId = 'planneta' | 'faz' | 'educamundi'

export interface ProjectTheme {
  label: string
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
}
