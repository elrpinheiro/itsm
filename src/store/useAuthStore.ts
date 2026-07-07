import { create } from 'zustand'

export interface AuthUser {
  nome: string
  email: string
  papel: string
  iniciais: string
}

interface AuthState {
  user: AuthUser | null
  login: (email: string, senha: string) => boolean
  logout: () => void
}

/**
 * Autenticação mockada para o MVP. Qualquer usuário/senha não vazios entram
 * como Admin Vitae — troque por chamada real de API quando o backend existir.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (email, senha) => {
    if (!email.trim() || !senha.trim()) return false
    set({
      user: {
        nome: 'Admin Vitae',
        email,
        papel: 'Administrador',
        iniciais: 'AD',
      },
    })
    return true
  },
  logout: () => set({ user: null }),
}))
