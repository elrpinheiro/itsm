export type FileKind = 'image' | 'pdf' | 'other'

export interface UploadedFile {
  file: File
  url: string
  kind: FileKind
}

export function kindOfFile(file: File): FileKind {
  if (file.type === 'application/pdf') return 'pdf'
  if (file.type.startsWith('image/')) return 'image'
  return 'other'
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const EXT_ICON: Record<string, string> = {
  pdf: '📕',
  doc: '📘',
  docx: '📘',
  xls: '📗',
  xlsx: '📗',
  png: '🖼️',
  jpg: '🖼️',
  jpeg: '🖼️',
  webp: '🖼️',
  gif: '🖼️',
}

export function iconForFile(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  return EXT_ICON[ext] ?? '📄'
}
