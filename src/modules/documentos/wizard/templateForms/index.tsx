import type { ComponentType } from 'react'
import type { TemplateId } from '@/types'
import type { TemplateFormProps } from './types'
import ManutencaoForm from './ManutencaoForm'
import ChecklistForm from './ChecklistForm'
import TermoForm from './TermoForm'
import HomologacaoForm from './HomologacaoForm'
import ReciboForm from './ReciboForm'

export const TEMPLATE_FORMS: Record<TemplateId, ComponentType<TemplateFormProps>> = {
  manut: ManutencaoForm,
  checklist: ChecklistForm,
  termo: TermoForm,
  homolog: HomologacaoForm,
  recibo: ReciboForm,
}

export type { TemplateFormProps }
