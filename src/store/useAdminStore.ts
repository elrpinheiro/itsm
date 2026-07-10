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
  grupoId?: string
  supervisorId?: string
  origem: OrigemUsuario
  comentarios?: string
}

export interface AddGrupoInput {
  nome: string
  descricao: string
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
}

interface AdminState {
  perfis: Perfil[]
  usuarios: Usuario[]
  grupos: Grupo[]
  fornecedores: Fornecedor[]
  addUsuario: (input: AddUsuarioInput) => void
  addGrupo: (input: AddGrupoInput) => void
  addFornecedor: (input: AddFornecedorInput) => void
  updatePermissao: (perfilId: string, matriz: PermissionMatrix) => void
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
          grupoId: input.grupoId || undefined,
          supervisorId: input.supervisorId || undefined,
          origem: input.origem,
          comentarios: input.comentarios?.trim() || undefined,
          status: 'Ativo',
        }
        set((s) => ({ usuarios: [...s.usuarios, usuario] }))
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
        }
        set((s) => ({ fornecedores: [...s.fornecedores, fornecedor] }))
      },
      updatePermissao: (perfilId, matriz) => {
        set((s) => ({
          perfis: s.perfis.map((p) => (p.id === perfilId && !p.builtIn ? { ...p, permissoes: matriz } : p)),
        }))
      },
    }),
    { name: 'itsm-admin-v2' },
  ),
)
