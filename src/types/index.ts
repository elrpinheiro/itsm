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

/** Dados de formulário livres, indexados por chave de campo do template ativo. */
export type DocumentFormData = Record<string, string>

export type WizardStep = 1 | 2 | 3 | 4
