import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import { useWizard } from './WizardContext'
import { renderPreviewBody } from './previewBody'

interface Props {
  style?: CSSProperties
  children?: ReactNode
}

const DocumentPreview = forwardRef<HTMLDivElement, Props>(function DocumentPreview({ style, children }, ref) {
  const { template, brand, formData, multiData, checklist, equipamentos } = useWizard()

  return (
    <div className="doc" style={style} ref={ref}>
      <div className="doc-head" style={{ borderBottomColor: brand.cor }}>
        <div>
          <div className="doc-head-title">{template.nome.toUpperCase()}</div>
          <div className="doc-head-code">{template.code}</div>
        </div>
        <img src={brand.logo} alt={brand.nome} className="doc-logo" />
      </div>
      <div className="doc-body">
        {renderPreviewBody(template.id, formData, multiData, brand, checklist, equipamentos)}
        <div style={{ height: 60 }} />
        <div className="doc-footer">{template.code}</div>
      </div>
      {children}
    </div>
  )
})

export default DocumentPreview
