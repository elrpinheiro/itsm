import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTemplateById } from '@/data/templates'
import { BRANDS } from '@/data/brands'
import type { BrandId, ChecklistItem, DocumentFormData, Signer, WizardStep } from '@/types'
import { WizardContext, type WizardContextValue } from './WizardContext'
import StepIndicator from './StepIndicator'
import Step1Fill from './Step1Fill'
import Step2Position from './Step2Position'
import Step3Sign from './Step3Sign'
import Step4Seal from './Step4Seal'

function buildInitialSigners(cargos: string[]): Signer[] {
  return cargos.map((cargo, i) => ({
    id: i + 1,
    nome: '',
    cargo,
    cpf: '',
    email: '',
    x: 18 + i * 185,
    y: 330,
    signed: false,
  }))
}

export default function DocumentWizard() {
  const { portfolioId, templateId, brandId } = useParams()
  const navigate = useNavigate()
  const template = templateId ? getTemplateById(templateId) : undefined
  const brand = brandId ? BRANDS[brandId as BrandId] : undefined

  const [step, setStep] = useState<WizardStep>(1)
  const [formData, setFormData] = useState<DocumentFormData>({})
  const [multiData, setMultiData] = useState<Record<string, string[]>>({})
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [signers, setSigners] = useState<Signer[]>([])
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0)

  useEffect(() => {
    if (!template) return
    setStep(1)
    setFormData({})
    setMultiData({})
    setChecklist([])
    setSigners(buildInitialSigners(template.signers.map((s) => s.cargo)))
    setCurrentSignerIndex(0)
  }, [template, brand])

  function handleVoltar() {
    navigate(portfolioId ? `/app/documentos/${portfolioId}` : '/app/documentos')
  }

  if (!template || !brand) {
    return (
      <div className="empty-box">
        <div style={{ fontSize: 16, fontWeight: 700 }}>Documento não encontrado</div>
        <button className="btn" style={{ marginTop: 12 }} onClick={handleVoltar}>
          ← Voltar
        </button>
      </div>
    )
  }

  const updateField = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }))
  const updateMultiField = (key: string, values: string[]) =>
    setMultiData((prev) => ({ ...prev, [key]: values }))

  const ctx: WizardContextValue = {
    template,
    brand,
    step,
    setStep,
    formData,
    updateField,
    multiData,
    updateMultiField,
    checklist,
    setChecklist,
    signers,
    setSigners,
    currentSignerIndex,
    setCurrentSignerIndex,
  }

  return (
    <WizardContext.Provider value={ctx}>
      <div className="topbar">
        <button className="btn" style={{ padding: '7px 12px' }} onClick={handleVoltar}>
          ← Voltar
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{template.nome}</div>
          <div style={{ fontSize: 11, color: 'var(--texto-sec)' }}>
            {template.code} · {brand.nome}
          </div>
        </div>
        <span className={`badge ${brand.badgeClass}`}>{brand.nome}</span>
      </div>

      <StepIndicator step={step} />

      {step === 1 && <Step1Fill />}
      {step === 2 && <Step2Position />}
      {step === 3 && <Step3Sign onFinish={() => setStep(4)} />}
      {step === 4 && <Step4Seal onNovoDocumento={handleVoltar} />}
    </WizardContext.Provider>
  )
}
