import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import type { Signer } from '@/types'
import SignatureSlot from '../documentos/wizard/SignatureSlot'
import FilePreview from './FilePreview'
import AssSignerList from './AssSignerList'
import type { UploadedFile } from './types'
import { FileBadge } from './UploadStep'

interface Props {
  uploaded: UploadedFile
  signers: Signer[]
  setSigners: Dispatch<SetStateAction<Signer[]>>
  onBack: () => void
  onNext: () => void
}

export default function PositionStep({ uploaded, signers, setSigners, onBack, onNext }: Props) {
  const docRef = useRef<HTMLDivElement>(null)
  const [bounds, setBounds] = useState({ width: 600, height: 420 })

  useEffect(() => {
    function measure() {
      if (docRef.current) {
        setBounds({ width: docRef.current.clientWidth, height: docRef.current.clientHeight })
      }
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  function handleMove(id: number, x: number, y: number) {
    setSigners((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)))
  }
  function handleRemove(id: number) {
    setSigners((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.id !== id)))
  }
  function handleAdd() {
    setSigners((prev) => [
      ...prev,
      {
        id: Math.max(0, ...prev.map((s) => s.id)) + 1,
        nome: '',
        cargo: '',
        cpf: '',
        email: '',
        x: 18 + ((prev.length * 35) % 200),
        y: Math.max(60, bounds.height - 70),
        signed: false,
      },
    ])
  }

  return (
    <div className="grid-fill">
      <div>
        <div style={{ marginBottom: 8 }}>
          <FileBadge file={uploaded.file} />
        </div>
        <div
          style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: 'var(--texto-sec)', letterSpacing: '.04em' }}
        >
          DOCUMENTO · ARRASTE OS CAMPOS AZUIS
        </div>
        <FilePreview uploaded={uploaded} ref={docRef} style={{ minHeight: 420 }}>
          {signers.map((s, i) => (
            <SignatureSlot
              key={s.id}
              signer={s}
              index={i}
              bounds={bounds}
              removable={signers.length > 1}
              onMove={handleMove}
              onRemove={handleRemove}
            />
          ))}
        </FilePreview>
        <div className="hint-txt">✥ Toque e arraste cada campo para a posição da assinatura. O ✕ remove o campo.</div>
      </div>
      <div>
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--texto-sec)', letterSpacing: '.04em' }}>
              SIGNATÁRIOS
            </div>
            <button className="btn" style={{ fontSize: 12, padding: '5px 12px' }} onClick={handleAdd}>
              <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> Adicionar
            </button>
          </div>
          <AssSignerList signers={signers} setSigners={setSigners} />
          <div className="hint-txt">Inclua quantos signatários forem necessários (gestor, testemunha, fiscal...).</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button className="btn" style={{ fontSize: 12 }} onClick={onBack}>
              ← Anexo
            </button>
            <button
              className="btn btn-primary"
              style={{ fontSize: 12, flex: 1, justifyContent: 'center' }}
              onClick={onNext}
            >
              Coletar assinaturas →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
