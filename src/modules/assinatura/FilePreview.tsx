import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import type { UploadedFile } from './types'
import { formatFileSize, iconForFile } from './types'

interface Props {
  uploaded: UploadedFile
  style?: CSSProperties
  children?: ReactNode
}

const FilePreview = forwardRef<HTMLDivElement, Props>(function FilePreview({ uploaded, style, children }, ref) {
  return (
    <div className="doc" style={{ background: '#f4f3ef', ...style }} ref={ref}>
      {uploaded.kind === 'image' && (
        <img
          src={uploaded.url}
          alt={uploaded.file.name}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#fff' }}
        />
      )}
      {uploaded.kind === 'pdf' && (
        <embed src={uploaded.url} type="application/pdf" style={{ width: '100%', height: '100%', border: 'none' }} />
      )}
      {uploaded.kind === 'other' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            background: '#fff',
          }}
        >
          <div style={{ fontSize: 46 }}>{iconForFile(uploaded.file)}</div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>{uploaded.file.name}</div>
          <div style={{ fontSize: 11, color: 'var(--texto-sec)' }}>{formatFileSize(uploaded.file.size)}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Pré-visualização não disponível para este formato</div>
        </div>
      )}
      {children}
    </div>
  )
})

export default FilePreview
