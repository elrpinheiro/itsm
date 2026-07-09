import type { Signer } from '@/types'

/** Marca estática (não-interativa) da assinatura já confirmada, na posição definida no passo de posicionamento — usada na prévia final e na captura para o PDF selado. */
export default function SignedMark({ signer }: { signer: Signer }) {
  return (
    <div className="signed-mark" style={{ left: signer.x, top: signer.y }}>
      {signer.assinaturaDataUrl ? (
        <img src={signer.assinaturaDataUrl} alt={`Assinatura de ${signer.nome || 'signatário'}`} />
      ) : (
        <div className="signed-mark-fallback">✓ assinado</div>
      )}
      <div className="signed-mark-caption">
        {signer.nome || 'Signatário'}
        {signer.cargo ? ` · ${signer.cargo}` : ''}
      </div>
    </div>
  )
}
