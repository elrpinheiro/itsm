import termoEntrega from '@/assets/docs/termo-entrega-conectaoz.pdf'
import termoDevolucao from '@/assets/docs/termo-devolucao-conectaoz.pdf'

export interface DocumentoCategoria {
  nome: string
  arquivoUrl: string
  nomeArquivo: string
}

/** Documento padrão a ser baixado, preenchido à mão e reanexado ao chamado, conforme a categoria
 * selecionada em Novo Atendimento (hoje só configurado para o ConectaOZ — Osasco). */
export const DOCUMENTO_POR_CATEGORIA: Record<string, DocumentoCategoria> = {
  'Entrega de Equipamentos': {
    nome: 'Termo de Entrega de Equipamentos',
    arquivoUrl: termoEntrega,
    nomeArquivo: 'Termo de Entrega de Equipamentos.pdf',
  },
  'Devolução de Equipamentos': {
    nome: 'Termo de Devolução de Equipamentos',
    arquivoUrl: termoDevolucao,
    nomeArquivo: 'Termo de Devolução de Equipamentos.pdf',
  },
}
