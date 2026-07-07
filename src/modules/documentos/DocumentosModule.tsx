import { Route, Routes } from 'react-router-dom'
import PortfoliosScreen from './PortfoliosScreen'
import TemplatesScreen from './TemplatesScreen'
import DocumentWizard from './wizard/DocumentWizard'

export default function DocumentosModule() {
  return (
    <Routes>
      <Route index element={<PortfoliosScreen />} />
      <Route path=":portfolioId" element={<TemplatesScreen />} />
      <Route path=":portfolioId/:templateId/:brandId" element={<DocumentWizard />} />
    </Routes>
  )
}
