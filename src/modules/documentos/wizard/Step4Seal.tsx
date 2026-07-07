import { useMemo } from 'react'
import { useWizard } from './WizardContext'
import { mockDocumentHash } from '@/utils/mockHash'

export default function Step4Seal({ onNovoDocumento }: { onNovoDocumento: () => void }) {
  const { template, brand, signers } = useWizard()
  const now = useMemo(() => new Date(), [])
  const hash = useMemo(
    () => mockDocumentHash(`${template.code}|${brand.id}|${now.toISOString()}`),
    [template.code, brand.id, now],
  )

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
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Hash SHA-256</div>
      <div className="hash-box" style={{ marginBottom: 14 }}>
        {hash}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Manifesto de evidências</div>
      <div style={{ background: 'var(--fundo)', borderRadius: 8, padding: '12px 15px', marginBottom: 15 }}>
        <div className="manifest-row">
          <span className="manifest-key">Documento</span>
          <span className="manifest-val">
            {template.code} · {template.nome}
          </span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">Empresa</span>
          <span className="manifest-val">{brand.nome}</span>
        </div>
        <div className="manifest-row">
          <span className="manifest-key">Sistema</span>
          <span className="manifest-val">Vitae Plugin v1.0 · Central de Documentos</span>
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
          <span className="manifest-key">Foto vinculada</span>
          <span className="manifest-val">registro_execucao.jpg · hash 9f2b...c41a</span>
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
        <button
          className="btn btn-primary"
          style={{ fontSize: 12 }}
          onClick={() =>
            alert(
              'No sistema real: baixa o PDF/A selado com assinaturas nas posições definidas + página de manifesto.',
            )
          }
        >
          ⬇ Baixar PDF selado
        </button>
        <button
          className="btn"
          style={{ fontSize: 12 }}
          onClick={() => alert('No sistema real: envia o PDF selado por e-mail/WhatsApp aos signatários.')}
        >
          ✉ Enviar aos signatários
        </button>
        <button className="btn" style={{ fontSize: 12, marginLeft: 'auto' }} onClick={onNovoDocumento}>
          ↻ Novo documento
        </button>
      </div>
    </div>
  )
}
