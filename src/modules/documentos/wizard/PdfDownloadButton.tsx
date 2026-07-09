import { useEffect, useRef, useState } from 'react'
import { generateSignedPdfBlob } from '@/utils/generateSignedPdf'

interface Props {
  documentEl: () => HTMLElement | null
  certificateEl: () => HTMLElement | null
  hash: string
  fileName: string
}

type Status = 'idle' | 'generating' | 'ready' | 'error'

/**
 * Gera o PDF selado (html2canvas + jsPDF) e só então mostra um link real para o usuário clicar,
 * em vez de disparar o download programaticamente: dentro de um iframe restrito (como a
 * pré-visualização de Artifacts), um clique sintético pode ser bloqueado pelo sandbox, mas um
 * clique de verdade do usuário num <a href download> tem chance muito maior de funcionar — e,
 * mesmo que o atributo download seja ignorado, o navegador ainda abre o PDF para o usuário salvar.
 */
export default function PdfDownloadButton({ documentEl, certificateEl, hash, fileName }: Props) {
  const [status, setStatus] = useState<Status>('idle')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfFileName, setPdfFileName] = useState<string>(`${fileName}.pdf`)
  const urlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  async function handleGenerate() {
    const docEl = documentEl()
    const certEl = certificateEl()
    if (!docEl || !certEl || status === 'generating') return
    setStatus('generating')
    try {
      const result = await generateSignedPdfBlob({ documentEl: docEl, certificateEl: certEl, hash, fileName })
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
      urlRef.current = result.url
      setPdfUrl(result.url)
      setPdfFileName(result.fileName)
      setStatus('ready')
    } catch (err) {
      console.error('Falha ao gerar o PDF selado', err)
      setStatus('error')
    }
  }

  if (status === 'ready' && pdfUrl) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <a className="btn btn-primary" style={{ fontSize: 12 }} href={pdfUrl} download={pdfFileName}>
          ⬇ Clique para baixar o PDF
        </a>
        <a
          style={{ fontSize: 11, color: 'var(--tema)', cursor: 'pointer' }}
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
        >
          abrir em nova aba
        </a>
      </span>
    )
  }

  return (
    <button className="btn btn-primary" style={{ fontSize: 12 }} onClick={handleGenerate} disabled={status === 'generating'}>
      {status === 'generating' && '⏳ Gerando PDF…'}
      {status === 'error' && '⚠ Tentar novamente'}
      {status === 'idle' && '⬇ Baixar PDF selado'}
    </button>
  )
}
