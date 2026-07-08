export interface GmudEtapa {
  key: string
  label: string
}

/** Etapas do fluxo de execução da GMUD (Gestão de Mudanças), na ordem exibida no formulário original. */
export const GMUD_ETAPAS: GmudEtapa[] = [
  { key: 'inicio', label: 'Início' },
  { key: 'backup', label: 'Backup' },
  { key: 'execucao', label: 'Execução' },
  { key: 'testes', label: 'Testes' },
  { key: 'rollback', label: 'Rollback' },
  { key: 'fim', label: 'Fim' },
]
