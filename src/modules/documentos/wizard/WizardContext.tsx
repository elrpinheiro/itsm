import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'
import type { Brand, ChecklistItem, DocumentFormData, Signer, TemplateDef, WizardStep } from '@/types'

export interface WizardContextValue {
  template: TemplateDef
  brand: Brand
  step: WizardStep
  setStep: (step: WizardStep) => void
  formData: DocumentFormData
  updateField: (key: string, value: string) => void
  checklist: ChecklistItem[]
  setChecklist: (items: ChecklistItem[]) => void
  signers: Signer[]
  setSigners: Dispatch<SetStateAction<Signer[]>>
  currentSignerIndex: number
  setCurrentSignerIndex: (index: number) => void
}

export const WizardContext = createContext<WizardContextValue | null>(null)

export function useWizard() {
  const ctx = useContext(WizardContext)
  if (!ctx) throw new Error('useWizard deve ser usado dentro de WizardContext.Provider')
  return ctx
}
