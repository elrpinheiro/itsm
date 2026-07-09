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
  { key: 'assist', path: 'assistencia', label: 'Assistência', icon: '🎧' },
  { key: 'admin', path: 'administracao', label: 'Administração', icon: '⚙️' },
  { key: 'ativos', path: 'ativos', label: 'Ativos', icon: '💻' },
  { key: 'docs', path: 'documentos', label: 'Central de Documentos', icon: '📁' },
  { key: 'basecon', path: 'base-conhecimento', label: 'Base de Conhecimento', icon: '📚' },
  { key: 'assinatura', path: 'assinatura-digital', label: 'Assinatura Digital', icon: '✍️' },
]
