/**
 * Registro central dos módulos do ITSM. Para adicionar um novo módulo,
 * inclua sua entrada aqui e registre a rota correspondente em App.tsx —
 * a aba aparece automaticamente na barra de módulos.
 */
export interface ModuleDef {
  key: string
  path: string
  label: string
  icon: string
}

export const MODULES: ModuleDef[] = [
  { key: 'docs', path: 'documentos', label: 'Central de Documentos', icon: '📁' },
  { key: 'assist', path: 'assistencia', label: 'Assistência', icon: '🛠' },
]
