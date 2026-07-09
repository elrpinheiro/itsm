import { useMemo, useRef, useState } from 'react'
import type { Signer } from '@/types'
import { mockDocumentHash } from '@/utils/mockHash'
import { generateSignedPdf } from '@/utils/generateSignedPdf'
import SignedMark from '../documentos/wizard/SignedMark'
import { formatFileSize } from './types'
import type { UploadedFile } from './types'
import FilePreview from './FilePreview'

interface Props {
  uploaded: UploadedFile
  signers: Signer[]
  onNovoEnvio: () => void
}

export default function SealStep({ uploaded, signers, onNovoEnvio }: Props) {
  const now = useMemo(() => new Date(), [])
  const hash = useMemo(
    () => mockDocumentHash(`${uploaded.file.name}|${uploaded.file.size}|${now.toISOString()}`),
    [uploaded.file.name, uploaded.file.size, now],
  )
  const docRef = useRef<HTMLDivElement>(null)
  const certRef = useRef<HTMLDivElement>(null)
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    if (!docRef.current || !certRef.current || generating) return
    setGenerating(true)
    try {
      await generateSignedPdf({
        documentEl: docRef.current,
        certificateEl: certRef.current,
        hash,
        fileName: `${uploaded.file.name.replace(/\.[^.]+$/, '').replace(/\s+/g, '_')}_selado`,
      })
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="card" style={{ padding: 18, maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: 'var(--verde-pale)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          🛡
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>Documento selado</div>
          <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>
            PDF/A não editável arquivado na Central de Documentos
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Documento final</div>
      <FilePreview uploaded={uploaded} ref={docRef} style={{ minHeight: 380, marginBottom: 14 }}>
        {signers.map((s) => (
          <SignedMark key={s.id} signer={s} />
        ))}
      </FilePreview>

      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Hash SHA-256</div>
      <div className="hash-box" style={{ marginBottom: 14 }}>
        {hash}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Manifesto de evidências</div>
      <div ref={certRef} style={{ background: 'var(--fundo)', borderRadius: 8, padding: '12px 15px', marginBottom: 15 }}>
        <div className="manifest-row">
          <span className="manifest-key">Arquivo</span>
          <span className="manifest-val">{uploaded.file.name}</span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">Tamanho</span>
          <span className="manifest-val">{formatFileSize(uploaded.file.size)}</span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">Sistema</span>
          <span className="manifest-val">Vitae Plugin v1.0 · Assinatura Digital</span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">Data/hora (NTP)</span>
          <span className="manifest-val">
            {now.toLocaleDateString('pt-BR')} {now.toLocaleTimeString('pt-BR')} BRT
          </span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">IP · Geolocalização</span>
          <span className="manifest-val">191.187.42.115 · -23.3054, -45.9668 (±8 m)</span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">Hash SHA-256</span>
          <span className="manifest-val">{hash}</span>
        </div>
        {signers.map((s, i) => (
          <div className="manifest-row" key={s.id}>
            <span className="manifest-key">Assinante {i + 1}</span>
            <span className="manifest-val">
              {s.nome || '—'} · CPF {s.cpf || '—'} · {s.cargo || '—'} · {s.email || '—'} · pos ({Math.round(s.x)},
              {Math.round(s.y)})
            </span>
          </div>
        ))}
        <div className="manifest-row">
          <span className="manifest-key">Carimbo do tempo</span>
          <span className="manifest-val">TSA RFC 3161 aplicado</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={handleDownload} disabled={generating}>
          {generating ? '⏳ Gerando PDF…' : '⬇ Baixar PDF selado'}
        </button>
        <button
          className="btn"
          style={{ fontSize: 12 }}
          onClick={() => alert('No sistema real: envia o PDF selado por e-mail/WhatsApp aos signatários.')}
        >
          ✉ Enviar aos signatários
        </button>
        <button className="btn" style={{ fontSize: 12, marginLeft: 'auto' }} onClick={onNovoEnvio}>
          ↻ Novo envio
        </button>
      </div>
    </div>
  )
}
