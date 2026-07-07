import type { ChecklistItem, DocumentFormData } from '@/types'

export interface TemplateFormProps {
  data: DocumentFormData
  checklist: ChecklistItem[]
  onChange: (key: string, value: string) => void
  onChecklistChange: (items: ChecklistItem[]) => void
}
