import { Fragment } from 'react'
import type { WizardStep } from '@/types'

const STEPS: { n: WizardStep; label: string }[] = [
  { n: 1, label: 'Preencher' },
  { n: 2, label: 'Posicionar' },
  { n: 3, label: 'Assinar' },
  { n: 4, label: 'Selagem' },
]

export default function StepIndicator({ step }: { step: WizardStep }) {
  return (
    <div className="step-wrap">
      {STEPS.map((s, i) => (
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
