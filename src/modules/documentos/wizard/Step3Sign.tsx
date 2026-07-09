import { useEffect, useRef, useState } from 'react'
import { useWizard } from './WizardContext'
import SignaturePad, { type SignaturePadHandle } from './SignaturePad'

export default function Step3Sign({ onFinish }: { onFinish: () => void }) {
  const { signers, setSigners, currentSignerIndex, setCurrentSignerIndex } = useWizard()
  const padRef = useRef<SignaturePadHandle>(null)

  useEffect(() => {
    const pendingIdx = signers.findIndex((s) => !s.signed)
    setCurrentSignerIndex(pendingIdx >= 0 ? pendingIdx : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signer = signers[currentSignerIndex]
  const [nome, setNome] = useState(signer?.nome ?? '')
  const [cpf, setCpf] = useState(signer?.cpf ?? '')
  const [cargo, setCargo] = useState(signer?.cargo ?? '')
  const [email, setEmail] = useState(signer?.email ?? '')

  useEffect(() => {
    setNome(signer?.nome ?? '')
    setCpf(signer?.cpf ?? '')
    setCargo(signer?.cargo ?? '')
    setEmail(signer?.email ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSignerIndex])

  if (!signer) return null

  function confirm() {
    const assinaturaDataUrl = padRef.current?.getDataURL() ?? undefined
    setSigners((prev) =>
      prev.map((s, i) =>
        i === currentSignerIndex ? { ...s, nome, cpf, cargo, email, signed: true, assinaturaDataUrl } : s,
      ),
    )
    if (currentSignerIndex < signers.length - 1) {
      setCurrentSignerIndex(currentSignerIndex + 1)
    } else {
      onFinish()
    }
  }

  return (
    <div className="card" style={{ padding: 16, maxWidth: 620, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span className="ev-mini">⏱ NTP servidor</span>
        <span className="ev-mini">⌁ IP 191.187.42.115</span>
        <span className="ev-mini">📍 -23.3054, -45.9668</span>
        <span className="ev-mini">📷 foto vinculada</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div className="signer-num" style={{ width: 32, height: 32, fontSize: 13 }}>
          {currentSignerIndex + 1}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{signer.nome || `Signatário ${currentSignerIndex + 1}`}</div>
          <div style={{ fontSize: 11, color: 'var(--texto-sec)' }}>{signer.cargo || 'Preencha os dados'}</div>
        </div>
        <span className="badge badge-amber">
          {currentSignerIndex + 1} de {signers.length}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div>
          <label className="field-label">Nome completo</label>
          <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>
        <div>
          <label className="field-label">CPF</label>
          <input type="text" placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div>
          <label className="field-label">Cargo / vínculo</label>
          <input type="text" value={cargo} onChange={(e) => setCargo(e.target.value)} />
        </div>
        <div>
          <label className="field-label">E-mail</label>
          <input
            type="text"
            placeholder="nome@empresa.com.br"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
      </div>
      <label className="field-label">Assinatura (dedo ou caneta eletrônica)</label>
      <SignaturePad key={currentSignerIndex} ref={padRef} />
      <label
        style={{
          fontSize: 12,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          cursor: 'pointer',
          marginTop: 11,
          lineHeight: 1.5,
        }}
      >
        <input type="checkbox" defaultChecked style={{ width: 'auto', marginTop: 2 }} />
        <span>
          Declaro ciência de que assinatura, dados, localização e horário serão registrados como evidência (MP
          2.200-2/2001 · LGPD).
        </span>
      </label>
      <div style={{ display: 'flex', gap: 8, marginTop: 13 }}>
        <button className="btn" style={{ fontSize: 12 }} onClick={() => padRef.current?.clear()}>
          ⌫ Limpar
        </button>
        <button className="btn btn-success" style={{ fontSize: 12, marginLeft: 'auto' }} onClick={confirm}>
          ✓ Confirmar assinatura
        </button>
      </div>
    </div>
  )
}
