import { useAuthStore } from './useAuthStore'
import { useAdminStore } from './useAdminStore'
import type { ModuleKey, ModulePermission, PermissionMatrix } from '@/data/administracaoMock'

const SEM_ACESSO: ModulePermission = { ver: 'nenhum', criar: false, editar: false }

/** Matriz de permissões completa do perfil do usuário logado (ou null se não houver sessão/perfil). */
export function usePermissionMatrix() {
  const perfilId = useAuthStore((s) => s.user?.perfilId)
  const perfis = useAdminStore((s) => s.perfis)
  return perfis.find((p) => p.id === perfilId)?.permissoes ?? null
}

/** Permissão de um módulo específico para o usuário logado — "sem acesso" por padrão. */
export function useModuleAccess(moduleKey: ModuleKey): ModulePermission {
  const matriz = usePermissionMatrix()
  return matriz?.[moduleKey] ?? SEM_ACESSO
}

/** Módulo(s) de permissão que cada entrada de navegação depende de — "Ferramentas" fica visível
 * se ao menos um dos dois sub-módulos (Central de Documentos / Base de Conhecimento) for acessível. */
const NAV_MODULE_KEYS: Record<string, ModuleKey[]> = {
  assistencia: ['assistencia'],
  administracao: ['administracao'],
  ativos: ['ativos'],
  ferramentas: ['documentos', 'baseConhecimento'],
  'assinatura-digital': ['assinatura'],
}

/** Função pura (não é hook) para filtrar módulos de navegação por uma matriz já obtida via usePermissionMatrix(). */
export function canSeeNavModule(matriz: PermissionMatrix | null, path: string): boolean {
  if (!matriz) return false
  const clean = path.replace(/^\//, '')
  const keys = NAV_MODULE_KEYS[clean] ?? []
  return keys.some((k) => matriz[k].ver !== 'nenhum')
}
