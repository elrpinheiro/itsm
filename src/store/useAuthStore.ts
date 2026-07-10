import { create } from 'zustand'
import { useAdminStore } from './useAdminStore'
import { initialsFromName } from '@/utils/initials'

export interface AuthUser {
  nome: string
  email: string
  papel: string
  iniciais: string
  perfilId: string
}

interface AuthState {
  user: AuthUser | null
  login: (loginOuEmail: string, senha: string) => boolean
  logout: () => void
}

/**
 * Autenticação para o MVP: valida usuário/senha contra o diretório real de usuários
 * (useAdminStore, persistido) — aceita tanto o "login" quanto o e-mail cadastrado.
 * A senha fica em texto plano só para esta simulação; troque por hash + backend real
 * quando o backend existir.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (loginOuEmail, senha) => {
    const valor = loginOuEmail.trim().toLowerCase()
    if (!valor || !senha.trim()) return false
    const { usuarios, perfis } = useAdminStore.getState()
    const usuario = usuarios.find(
      (u) => u.status === 'Ativo' && senha === u.senha && (valor === u.login.toLowerCase() || valor === u.email.toLowerCase()),
    )
    if (!usuario) return false
    const perfil = perfis.find((p) => p.id === usuario.perfilId)
    set({
      user: {
        nome: usuario.nome,
        email: usuario.email,
        papel: perfil?.nome ?? usuario.perfilId,
        iniciais: initialsFromName(usuario.nome),
        perfilId: usuario.perfilId,
      },
    })
    return true
  },
  logout: () => set({ user: null }),
}))
