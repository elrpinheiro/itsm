import type { ComponentType } from 'react'
import type { TemplateId } from '@/types'
import type { TemplateFormProps } from './types'
import ManutencaoForm from './ManutencaoForm'
import ChecklistForm from './ChecklistForm'
import TermoForm from './TermoForm'
import HomologacaoForm from './HomologacaoForm'
import ReciboForm from './ReciboForm'
import DevolucaoForm from './DevolucaoForm'
import UsbForm from './UsbForm'
import FormatacaoForm from './FormatacaoForm'
import MobilizacaoForm from './MobilizacaoForm'
import GmudForm from './GmudForm'

export const TEMPLATE_FORMS: Record<TemplateId, ComponentType<TemplateFormProps>> = {
  manut: ManutencaoForm,
  checklist: ChecklistForm,
  termo: TermoForm,
  homolog: HomologacaoForm,
  recibo: ReciboForm,
  devolucao: DevolucaoForm,
  usb: UsbForm,
  formatacao: FormatacaoForm,
  mobilizacao: MobilizacaoForm,
  gmud: GmudForm,
}

export type { TemplateFormProps }
