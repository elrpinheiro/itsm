import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

interface GenerateSignedPdfOptions {
  /** Elemento com o documento + marcas de assinatura posicionadas (página 1). */
  documentEl: HTMLElement
  /** Elemento com o manifesto/certificado de evidências (página 2). */
  certificateEl: HTMLElement
  /** Hash SHA-256 (ou equivalente) do documento, registrado na página 1. */
  hash: string
  /** Nome do arquivo baixado, sem extensão. */
  fileName: string
}

const PAGE_MARGIN = 24

async function renderElementToImage(el: HTMLElement) {
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
  return { dataUrl: canvas.toDataURL('image/png'), width: canvas.width, height: canvas.height }
}

/**
 * Monta um único PDF fechado com 2 páginas: a primeira reproduz o documento com as assinaturas
 * nas posições definidas e traz o registro do hash; a segunda é o certificado/manifesto de
 * evidências da selagem. Roda inteiramente no navegador (html2canvas + jsPDF), sem backend.
 */
export async function generateSignedPdf({ documentEl, certificateEl, hash, fileName }: GenerateSignedPdfOptions) {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const maxWidth = pageWidth - PAGE_MARGIN * 2

  // Página 1 — documento + assinaturas, reservando uma faixa no rodapé para o hash.
  const hashBandHeight = 46
  const page1MaxHeight = pageHeight - PAGE_MARGIN * 2 - hashBandHeight
  const doc1 = await renderElementToImage(documentEl)
  let w1 = maxWidth
  let h1 = (doc1.height * w1) / doc1.width
  if (h1 > page1MaxHeight) {
    h1 = page1MaxHeight
    w1 = (doc1.width * h1) / doc1.height
  }
  const x1 = (pageWidth - w1) / 2
  pdf.addImage(doc1.dataUrl, 'PNG', x1, PAGE_MARGIN, w1, h1)

  const hashY = PAGE_MARGIN + h1 + 22
  pdf.setDrawColor(211, 209, 199)
  pdf.line(PAGE_MARGIN, hashY - 14, pageWidth - PAGE_MARGIN, hashY - 14)
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.text('Hash SHA-256 do documento selado', PAGE_MARGIN, hashY)
  pdf.setFont('courier', 'normal')
  pdf.setFontSize(9)
  pdf.text(hash, PAGE_MARGIN, hashY + 13, { maxWidth })

  // Página 2 — certificado digital / manifesto de evidências.
  pdf.addPage()
  const doc2 = await renderElementToImage(certificateEl)
  let w2 = maxWidth
  let h2 = (doc2.height * w2) / doc2.width
  const page2MaxHeight = pageHeight - PAGE_MARGIN * 2
  if (h2 > page2MaxHeight) {
    h2 = page2MaxHeight
    w2 = (doc2.width * h2) / doc2.height
  }
  const x2 = (pageWidth - w2) / 2
  pdf.addImage(doc2.dataUrl, 'PNG', x2, PAGE_MARGIN, w2, h2)

  pdf.save(`${fileName}.pdf`)
}
