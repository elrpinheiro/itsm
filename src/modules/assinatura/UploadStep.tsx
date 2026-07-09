import { useRef, useState, type DragEvent } from 'react'
import { formatFileSize, iconForFile } from './types'

const ACCEPT = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.gif'

interface Props {
  onSelect: (file: File) => void
}

export default function UploadStep({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) onSelect(file)
  }

  return (
    <div className="card" style={{ padding: 24, maxWidth: 620, margin: '0 auto' }}>
      <div
        className={`upload-drop${dragging ? ' on' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{ fontSize: 36 }}>📎</div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Arraste um arquivo aqui ou clique para escolher</div>
        <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginTop: 4 }}>PDF, Word (.doc/.docx) ou imagem (PNG/JPG)</div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelect(file)
            e.target.value = ''
          }}
        />
      </div>
      <div className="hint-txt">
        O arquivo é usado apenas para posicionar os campos de assinatura e gerar o documento selado — nada é
        enviado a servidores externos nesta simulação.
      </div>
    </div>
  )
}

export function FileBadge({ file }: { file: File }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 18 }}>{iconForFile(file)}</span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--texto-sec)' }}>{formatFileSize(file.size)}</div>
      </div>
    </div>
  )
}
