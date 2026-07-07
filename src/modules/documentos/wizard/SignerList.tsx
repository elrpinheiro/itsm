import { useWizard } from './WizardContext'

export default function SignerList() {
  const { signers, setSigners } = useWizard()

  function update(id: number, field: 'nome' | 'cargo' | 'email', value: string) {
    setSigners((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }
  function remove(id: number) {
    setSigners((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)))
  }

  return (
    <div>
      {signers.map((s, i) => (
        <div className="signer-row" key={s.id}>
          <div className={`signer-num${s.signed ? ' done' : ''}`}>{s.signed ? '✓' : i + 1}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              type="text"
              value={s.nome}
              placeholder="Nome do signatário"
              style={{ fontSize: 12, padding: '6px 9px', marginBottom: 5 }}
              onChange={(e) => update(s.id, 'nome', e.target.value)}
            />
            <input
              type="text"
              value={s.cargo}
              placeholder="Cargo / vínculo"
              style={{ fontSize: 11, padding: '5px 9px', marginBottom: 5 }}
              onChange={(e) => update(s.id, 'cargo', e.target.value)}
            />
            <input
              type="text"
              value={s.email}
              placeholder="E-mail (recebe cópia do documento selado)"
              style={{ fontSize: 11, padding: '5px 9px' }}
              onChange={(e) => update(s.id, 'email', e.target.value)}
            />
          </div>
          {signers.length > 1 && (
            <span
              style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 15, marginTop: 4 }}
              onClick={() => remove(s.id)}
            >
              🗑
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
