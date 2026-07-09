import { useEffect, useState } from 'react'
import type { Signer } from '@/types'
import StepIndicator from '../documentos/wizard/StepIndicator'
import UploadStep from './UploadStep'
import PositionStep from './PositionStep'
import SignStep from './SignStep'
import SealStep from './SealStep'
import { kindOfFile, type UploadedFile } from './types'

type AssStep = 1 | 2 | 3 | 4
const STEP_LABELS = ['Anexar', 'Posicionar', 'Assinar', 'Selagem']

function buildDefaultSigners(): Signer[] {
  return [{ id: 1, nome: '', cargo: '', cpf: '', email: '', x: 18, y: 330, signed: false }]
}

export default function AssinaturaWizard() {
  const [step, setStep] = useState<AssStep>(1)
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null)
  const [signers, setSigners] = useState<Signer[]>(buildDefaultSigners)
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0)

  useEffect(() => {
    return () => {
      if (uploaded) URL.revokeObjectURL(uploaded.url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uploaded])

  function handleSelect(file: File) {
    setUploaded({ file, url: URL.createObjectURL(file), kind: kindOfFile(file) })
    setStep(2)
  }

  function handleReset() {
    setUploaded(null)
    setSigners(buildDefaultSigners())
    setCurrentSignerIndex(0)
    setStep(1)
  }

  return (
    <div>
      <div className="topbar">
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>✍️ Assinatura Digital</div>
          <div style={{ fontSize: 11, color: 'var(--texto-sec)' }}>
            Anexe qualquer PDF, Word ou imagem para coletar assinaturas
          </div>
        </div>
      </div>

      <StepIndicator step={step} labels={STEP_LABELS} />

      {step === 1 && <UploadStep onSelect={handleSelect} />}
      {step === 2 && uploaded && (
        <PositionStep
          uploaded={uploaded}
          signers={signers}
          setSigners={setSigners}
          onBack={handleReset}
          onNext={() => setStep(3)}
        />
      )}
      {step === 3 && uploaded && (
        <SignStep
          signers={signers}
          setSigners={setSigners}
          currentSignerIndex={currentSignerIndex}
          setCurrentSignerIndex={setCurrentSignerIndex}
          onFinish={() => setStep(4)}
        />
      )}
      {step === 4 && uploaded && <SealStep uploaded={uploaded} signers={signers} onNovoEnvio={handleReset} />}
    </div>
  )
}
