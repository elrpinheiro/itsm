interface FieldProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export function TextField({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <div className="frow">
      <label className="field-label">{label}</label>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

export function TextAreaField({ label, value, placeholder, onChange }: FieldProps) {
  return (
    <div className="frow">
      <label className="field-label">{label}</label>
      <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

interface RadioFieldProps {
  label: string
  name: string
  value: string
  options: string[]
  onChange: (value: string) => void
}

export function RadioField({ label, name, value, options, onChange }: RadioFieldProps) {
  return (
    <div className="frow">
      <label className="field-label">{label}</label>
      <div className="radio-line">
        {options.map((opt) => (
          <label key={opt}>
            <input type="radio" name={name} checked={value === opt} onChange={() => onChange(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

interface CheckboxGroupFieldProps {
  label: string
  values: string[]
  options: string[]
  onChange: (values: string[]) => void
}

/** Grupo de múltipla escolha (checkboxes) — usado nos campos que no formulário original aceitam mais de uma marcação. */
export function CheckboxGroupField({ label, values, options, onChange }: CheckboxGroupFieldProps) {
  function toggle(opt: string) {
    onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt])
  }
  return (
    <div className="frow">
      <label className="field-label">{label}</label>
      <div className="radio-line">
        {options.map((opt) => (
          <label key={opt}>
            <input type="checkbox" checked={values.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  )
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--titulo-acento)',
        textTransform: 'uppercase',
        letterSpacing: '.05em',
        margin: '16px 0 8px',
        paddingBottom: 4,
        borderBottom: '1px solid var(--borda)',
      }}
    >
      {children}
    </div>
  )
}
