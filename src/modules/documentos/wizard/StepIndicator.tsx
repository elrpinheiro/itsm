import { Fragment } from 'react'
import type { WizardStep } from '@/types'

const STEPS: { n: WizardStep; label: string }[] = [
  { n: 1, label: 'Preencher' },
  { n: 2, label: 'Posicionar' },
  { n: 3, label: 'Assinar' },
  { n: 4, label: 'Selagem' },
]

interface Props {
  step: WizardStep
  labels?: string[]
}

export default function StepIndicator({ step, labels }: Props) {
  const steps = labels ? STEPS.map((s, i) => ({ ...s, label: labels[i] ?? s.label })) : STEPS
  return (
    <div className="step-wrap">
      {steps.map((s, i) => (
        <Fragment key={s.n}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className={`stepn${s.n < step ? ' done' : ''}${s.n === step ? ' active' : ''}`}>
              {s.n < step ? '✓' : s.n}
            </div>
            <span className={`stepl${s.n === step ? ' active' : ''}`}>{s.label}</span>
          </div>
          {i < STEPS.length - 1 && <div className="stepline" />}
        </Fragment>
      ))}
    </div>
  )
}
