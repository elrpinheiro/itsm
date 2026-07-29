import termoEntregaProfessor from '@/assets/docs/termo-entrega-conectaoz-professor.docx?url'
import termoEntrega4Ano from '@/assets/docs/termo-entrega-conectaoz-4-ano.docx?url'
import termoEntrega5Ano from '@/assets/docs/termo-entrega-conectaoz-5-ano.docx?url'
import termoDevolucaoKit from '@/assets/docs/termo-devolucao-conectaoz-kit.docx?url'

export interface DocumentoCategoria {
  nome: string
  arquivoUrl: string
  nomeArquivo: string
}

/** Termos a baixar, preencher à mão e reanexar ao chamado, conforme a categoria selecionada — hoje só
 * configurado para o ConectaOZ — Osasco, categoria "Kit Educacional" (retirada/entrega e devolução do
 * kit tecnológico do aluno/professor). Usado tanto em Novo Atendimento quanto no card "Termo" do
 * detalhe do chamado. */
export const DOCUMENTO_POR_CATEGORIA: Record<string, DocumentoCategoria[]> = {
  'Kit Educacional': [
    {
      nome: 'Termo de Entrega — Professor',
      arquivoUrl: termoEntregaProfessor,
      nomeArquivo: 'Termo de Entrega — Professor.docx',
    },
    {
      nome: 'Termo de Entrega — 4º Ano',
      arquivoUrl: termoEntrega4Ano,
      nomeArquivo: 'Termo de Entrega — 4º Ano.docx',
    },
    {
      nome: 'Termo de Entrega — 5º Ano',
      arquivoUrl: termoEntrega5Ano,
      nomeArquivo: 'Termo de Entrega — 5º Ano.docx',
    },
    {
      nome: 'Termo de Devolução',
      arquivoUrl: termoDevolucaoKit,
      nomeArquivo: 'Termo de Devolução.docx',
    },
  ],
}
