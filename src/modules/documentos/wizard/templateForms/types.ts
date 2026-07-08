import type { ChecklistItem, DocumentFormData } from '@/types'

export interface TemplateFormProps {
  data: DocumentFormData
  checklist: ChecklistItem[]
  multiData: Record<string, string[]>
  onChange: (key: string, value: string) => void
  onChecklistChange: (items: ChecklistItem[]) => void
  onMultiChange: (key: string, values: string[]) => void
}
