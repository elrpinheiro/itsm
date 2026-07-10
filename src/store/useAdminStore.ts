import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { PERFIS, USUARIOS, type Perfil, type Usuario, type PermissionMatrix } from '@/data/administracaoMock'

function uniqueId(base: string, taken: Set<string>): string {
  const safeBase = base || 'usuario'
  let id = safeBase
  let n = 2
  while (taken.has(id)) {
    id = `${safeBase}-${n}`
    n += 1
  }
  return id
}

export interface AddUsuarioInput {
  nome: string
  email: string
  login: string
  senha: string
  perfilId: string
  origem: Usuario['origem']
}

interface AdminState {
  perfis: Perfil[]
  usuarios: Usuario[]
  addUsuario: (input: AddUsuarioInput) => void
  updatePermissao: (perfilId: string, matriz: PermissionMatrix) => void
}

/**
 * Perfis e usuários reais do sistema (persistidos em localStorage) — fonte única de verdade
 * também usada pelo login (useAuthStore) para autenticar e resolver a matriz de permissões
 * do usuário. Seedado com o catálogo de fábrica em src/data/administracaoMock.ts.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      perfis: PERFIS,
      usuarios: USUARIOS,
      addUsuario: (input) => {
        const taken = new Set(get().usuarios.map((u) => u.id))
        const id = uniqueId(input.login.trim().toLowerCase(), taken)
        const usuario: Usuario = {
          id,
          nome: input.nome.trim(),
          email: input.email.trim(),
          login: input.login.trim(),
          senha: input.senha,
          perfilId: input.perfilId,
          origem: input.origem,
          status: 'Ativo',
        }
        set((s) => ({ usuarios: [...s.usuarios, usuario] }))
      },
      updatePermissao: (perfilId, matriz) => {
        set((s) => ({
          perfis: s.perfis.map((p) => (p.id === perfilId && !p.builtIn ? { ...p, permissoes: matriz } : p)),
        }))
      },
    }),
    { name: 'itsm-admin' },
  ),
)
