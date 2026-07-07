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
