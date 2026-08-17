import testeOsascoConectaoz from '@/assets/kb/teste-osasco-conectaoz.pdf?url'

export interface ArquivoBaseConhecimento {
  titulo: string
  arquivoUrl: string
  nomeArquivo: string
}

/** Arquivos anexados à Base de Conhecimento de cada entidade — enquanto o módulo em si (artigos
 * escritos, busca) segue "Em construção", isso permite já guardar/consultar documentos de referência
 * por projeto. Chave = Project.id (ver src/data/projects.ts). */
export const ARQUIVOS_BASE_CONHECIMENTO: Record<string, ArquivoBaseConhecimento[]> = {
  'osasco-conectaoz': [
    {
      titulo: 'Arquivo teste',
      arquivoUrl: testeOsascoConectaoz,
      nomeArquivo: 'Arquivo teste — ConectaOZ Osasco.pdf',
    },
  ],
}
