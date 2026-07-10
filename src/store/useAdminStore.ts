import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  PERFIS,
  USUARIOS,
  GRUPOS,
  FORNECEDORES,
  type Perfil,
  type Usuario,
  type Grupo,
  type Fornecedor,
  type PermissionMatrix,
  type CategoriaUsuario,
  type OrigemUsuario,
  type TipoFornecedor,
} from '@/data/administracaoMock'

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '')
}

function uniqueId(base: string, taken: Set<string>): string {
  const safeBase = base || 'item'
  let id = safeBase
  let n = 2
  while (taken.has(id)) {
    id = `${safeBase}-${n}`
    n += 1
  }
  return id
}

export interface AddUsuarioInput {
  primeiroNome: string
  sobrenome: string
  email: string
  login: string
  senha: string
  telefone?: string
  celular?: string
  cargo?: string
  categoria?: CategoriaUsuario
  projetoId?: string
  perfilId: string
  grupoIds?: string[]
  supervisorId?: string
  origem: OrigemUsuario
  comentarios?: string
}

export interface UpdateUsuarioInput {
  primeiroNome: string
  sobrenome: string
  email: string
  login: string
  /** Deixe em branco para manter a senha atual. */
  novaSenha?: string
  telefone?: string
  celular?: string
  cargo?: string
  categoria?: CategoriaUsuario
  projetoId?: string
  perfilId: string
  grupoIds?: string[]
  supervisorId?: string
  origem: OrigemUsuario
  comentarios?: string
}

export interface AddGrupoInput {
  nome: string
  descricao: string
  projetoId?: string
  visivelComoSolicitante: boolean
  visivelComoAtribuicao: boolean
  podeSerNotificado: boolean
}

export interface AddFornecedorInput {
  empresa: string
  tipo: TipoFornecedor
  servico: string
  email: string
  telefone: string
  site?: string
  endereco?: string
  cidade?: string
  estado?: string
  comentarios?: string
  projetoId?: string
}

export interface AddPerfilInput {
  nome: string
  descricao: string
  projetoId?: string
}

export type AdminActionResult = { ok: true } | { ok: false; error: string }

interface AdminState {
  perfis: Perfil[]
  usuarios: Usuario[]
  grupos: Grupo[]
  fornecedores: Fornecedor[]
  addUsuario: (input: AddUsuarioInput) => void
  updateUsuario: (id: string, input: UpdateUsuarioInput) => void
  toggleUsuarioStatus: (id: string) => void
  removeUsuario: (id: string) => AdminActionResult
  addUsuarioToGrupo: (usuarioId: string, grupoId: string) => void
  removeUsuarioFromGrupo: (usuarioId: string, grupoId: string) => void
  addGrupo: (input: AddGrupoInput) => void
  addFornecedor: (input: AddFornecedorInput) => void
  addPerfil: (input: AddPerfilInput) => string
  removePerfil: (id: string) => AdminActionResult
  updatePermissao: (perfilId: string, matriz: PermissionMatrix) => void
}

const PERMISSAO_EM_BRANCO: PermissionMatrix = {
  assistencia: { ver: 'nenhum', criar: false, editar: false },
  documentos: { ver: 'nenhum', criar: false, editar: false },
  baseConhecimento: { ver: 'nenhum', criar: false, editar: false },
  assinatura: { ver: 'nenhum', criar: false, editar: false },
  administracao: { ver: 'nenhum', criar: false, editar: false },
  ativos: { ver: 'nenhum', criar: false, editar: false },
}

/**
 * Perfis, usuários, grupos e fornecedores reais do sistema (persistidos em localStorage) — fonte
 * única de verdade também usada pelo login (useAuthStore) para autenticar e resolver a matriz de
 * permissões do usuário. Seedado com o catálogo de fábrica em src/data/administracaoMock.ts.
 */
export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      perfis: PERFIS,
      usuarios: USUARIOS,
      grupos: GRUPOS,
      fornecedores: FORNECEDORES,
      addUsuario: (input) => {
        const taken = new Set(get().usuarios.map((u) => u.id))
        const id = uniqueId(input.login.trim().toLowerCase(), taken)
        const usuario: Usuario = {
          id,
          primeiroNome: input.primeiroNome.trim(),
          sobrenome: input.sobrenome.trim(),
          nome: `${input.primeiroNome.trim()} ${input.sobrenome.trim()}`.trim(),
          email: input.email.trim(),
          login: input.login.trim(),
          senha: input.senha,
          telefone: input.telefone?.trim() || undefined,
          celular: input.celular?.trim() || undefined,
          cargo: input.cargo?.trim() || undefined,
          categoria: input.categoria,
          projetoId: input.projetoId || undefined,
          perfilId: input.perfilId,
          grupoIds: input.grupoIds?.length ? input.grupoIds : undefined,
          supervisorId: input.supervisorId || undefined,
          origem: input.origem,
          comentarios: input.comentarios?.trim() || undefined,
          status: 'Ativo',
        }
        set((s) => ({ usuarios: [...s.usuarios, usuario] }))
      },
      updateUsuario: (id, input) => {
        set((s) => ({
          usuarios: s.usuarios.map((u) => {
            if (u.id !== id) return u
            return {
              ...u,
              primeiroNome: input.primeiroNome.trim(),
              sobrenome: input.sobrenome.trim(),
              nome: `${input.primeiroNome.trim()} ${input.sobrenome.trim()}`.trim(),
              email: input.email.trim(),
              login: input.login.trim(),
              senha: input.novaSenha?.trim() ? input.novaSenha : u.senha,
              telefone: input.telefone?.trim() || undefined,
              celular: input.celular?.trim() || undefined,
              cargo: input.cargo?.trim() || undefined,
              categoria: input.categoria,
              projetoId: input.projetoId || undefined,
              perfilId: input.perfilId,
              grupoIds: input.grupoIds?.length ? input.grupoIds : undefined,
              supervisorId: input.supervisorId || undefined,
              origem: input.origem,
              comentarios: input.comentarios?.trim() || undefined,
            }
          }),
        }))
      },
      toggleUsuarioStatus: (id) => {
        set((s) => ({
          usuarios: s.usuarios.map((u) => (u.id === id ? { ...u, status: u.status === 'Ativo' ? 'Inativo' : 'Ativo' } : u)),
        }))
      },
      removeUsuario: (id) => {
        set((s) => ({ usuarios: s.usuarios.filter((u) => u.id !== id) }))
        return { ok: true }
      },
      addUsuarioToGrupo: (usuarioId, grupoId) => {
        set((s) => ({
          usuarios: s.usuarios.map((u) =>
            u.id === usuarioId && !(u.grupoIds ?? []).includes(grupoId)
              ? { ...u, grupoIds: [...(u.grupoIds ?? []), grupoId] }
              : u,
          ),
        }))
      },
      removeUsuarioFromGrupo: (usuarioId, grupoId) => {
        set((s) => ({
          usuarios: s.usuarios.map((u) =>
            u.id === usuarioId ? { ...u, grupoIds: (u.grupoIds ?? []).filter((g) => g !== grupoId) } : u,
          ),
        }))
      },
      addGrupo: (input) => {
        const taken = new Set(get().grupos.map((g) => g.id))
        const id = uniqueId(`grp-${slugify(input.nome)}`, taken)
        const grupo: Grupo = { id, ...input, nome: input.nome.trim(), descricao: input.descricao.trim() }
        set((s) => ({ grupos: [...s.grupos, grupo] }))
      },
      addFornecedor: (input) => {
        const taken = new Set(get().fornecedores.map((f) => f.id))
        const id = uniqueId(`forn-${slugify(input.empresa)}`, taken)
        const fornecedor: Fornecedor = {
          id,
          empresa: input.empresa.trim(),
          tipo: input.tipo,
          servico: input.servico.trim(),
          email: input.email.trim(),
          telefone: input.telefone.trim(),
          site: input.site?.trim() || undefined,
          endereco: input.endereco?.trim() || undefined,
          cidade: input.cidade?.trim() || undefined,
          estado: input.estado?.trim() || undefined,
          comentarios: input.comentarios?.trim() || undefined,
          projetoId: input.projetoId || undefined,
        }
        set((s) => ({ fornecedores: [...s.fornecedores, fornecedor] }))
      },
      addPerfil: (input) => {
        const taken = new Set(get().perfis.map((p) => p.id))
        const id = uniqueId(slugify(input.nome), taken)
        const perfil: Perfil = {
          id,
          nome: input.nome.trim(),
          descricao: input.descricao.trim(),
          projetoId: input.projetoId || undefined,
          permissoes: PERMISSAO_EM_BRANCO,
        }
        set((s) => ({ perfis: [...s.perfis, perfil] }))
        return id
      },
      removePerfil: (id) => {
        const perfil = get().perfis.find((p) => p.id === id)
        if (!perfil) return { ok: false, error: 'Perfil não encontrado.' }
        if (perfil.builtIn) return { ok: false, error: 'Perfis de fábrica não podem ser excluídos.' }
        const emUso = get().usuarios.some((u) => u.perfilId === id)
        if (emUso) return { ok: false, error: 'Existem usuários com este perfil — troque o perfil deles antes de excluir.' }
        set((s) => ({ perfis: s.perfis.filter((p) => p.id !== id) }))
        return { ok: true }
      },
      updatePermissao: (perfilId, matriz) => {
        set((s) => ({
          perfis: s.perfis.map((p) => (p.id === perfilId && !p.builtIn ? { ...p, permissoes: matriz } : p)),
        }))
      },
    }),
    { name: 'itsm-admin-v5' },
  ),
)
