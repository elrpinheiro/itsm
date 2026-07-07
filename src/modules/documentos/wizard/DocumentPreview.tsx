import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { useWizard } from './WizardContext'
import { renderPreviewBody } from './previewBody'

interface Props {
  style?: CSSProperties
  children?: ReactNode
}

const DocumentPreview = forwardRef<HTMLDivElement, Props>(function DocumentPreview({ style, children }, ref) {
  const { template, brand, formData, checklist } = useWizard()

  return (
    <div className="doc" style={style} ref={ref}>
      <div className="doc-head" style={{ background: brand.cor }}>
        <span>{template.nome.toUpperCase()}</span>
        <span>{brand.nome.toUpperCase()}</span>
      </div>
      <div className="doc-body">
        {renderPreviewBody(template.id, formData, brand, checklist)}
        <div style={{ height: 70 }} />
      </div>
      {children}
    </div>
  )
})

export default DocumentPreview
