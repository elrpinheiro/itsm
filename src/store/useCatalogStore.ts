import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Brand, Localizacao, Project, ProjectTheme } from '@/types'
import { BRANDS } from '@/data/brands'
import { PROJECT_THEMES } from '@/data/projectThemes'
import { PROJECTS } from '@/data/projects'
import { LOCALIZACOES_TESTE } from '@/data/localizacoes'
import { derivePalette } from '@/utils/color'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
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

function uniqueLocId(taken: Set<string>): string {
  let id = `loc-${Date.now()}`
  while (taken.has(id)) id = `loc-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  return id
}

export interface AddBrandInput {
  nome: string
  razaoSocial: string
  cor: string
  logo: string
}

export interface AddProjectInput {
  nome: string
  cidade: string
  brandId: string
  logo: string
}

export interface UpdateResult {
  ok: boolean
  error?: string
}

interface CatalogState {
  customBrands: Brand[]
  customThemes: Record<string, ProjectTheme>
  customProjects: Project[]
  /** Edições sobre marcas de fábrica ou criadas pelo admin — aplicadas por cima do registro base. */
  brandOverrides: Record<string, Partial<AddBrandInput> & { status?: 'Ativo' | 'Inativo' }>
  /** Edições (nome/cidade/logo/marca/wallpaper/status) sobre entidades de fábrica ou criadas pelo admin. */
  projectOverrides: Record<string, Partial<AddProjectInput> & { wallpaper?: string | null; status?: 'Ativo' | 'Inativo' }>
  /** Localizações reais cadastradas por entidade — substitui a lista de teste (Teste 1/2/3) enquanto houver ao menos uma Ativa. */
  customLocalizacoes: Record<string, Localizacao[]>
  addBrand: (input: AddBrandInput) => string
  updateBrand: (id: string, patch: Partial<AddBrandInput> & { status?: 'Ativo' | 'Inativo' }) => void
  addProject: (input: AddProjectInput) => string
  updateProject: (id: string, patch: Partial<AddProjectInput> & { wallpaper?: string | null; status?: 'Ativo' | 'Inativo' }) => void
  addLocalizacao: (projetoId: string, nome: string) => void
  renameLocalizacao: (projetoId: string, locId: string, nome: string) => void
  toggleLocalizacaoStatus: (projetoId: string, locId: string) => void
  removeLocalizacao: (projetoId: string, locId: string) => void
}

/**
 * Empresas e entidades criadas pelo administrador em tempo de execução — persistidos
 * em localStorage e mesclados com o catálogo "de fábrica" (src/data/*) em toda a
 * aplicação. Logos são guardados como data URL (já reduzidos em src/utils/image.ts).
 */
export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      customBrands: [],
      customThemes: {},
      customProjects: [],
      brandOverrides: {},
      projectOverrides: {},
      customLocalizacoes: {},
      addBrand: (input) => {
        const taken = new Set([...Object.keys(BRANDS), ...get().customBrands.map((b) => b.id)])
        const id = uniqueId(slugify(input.nome), taken)
        const palette = derivePalette(input.cor)
        const brand: Brand = {
          id,
          nome: input.nome,
          razaoSocial: input.razaoSocial || input.nome,
          cor: input.cor,
          logo: input.logo,
        }
        const theme: ProjectTheme = {
          label: input.nome,
          logo: input.logo,
          medio: input.cor,
          ...palette,
        }
        set((s) => ({
          customBrands: [...s.customBrands, brand],
          customThemes: { ...s.customThemes, [id]: theme },
        }))
        return id
      },
      addProject: (input) => {
        const taken = new Set([...PROJECTS.map((p) => p.id), ...get().customProjects.map((p) => p.id)])
        const id = uniqueId(`${input.brandId}-${slugify(input.cidade)}-${slugify(input.nome)}`, taken)
        const project: Project = {
          id,
          cidade: input.cidade,
          nome: input.nome,
          brandId: input.brandId,
          logo: input.logo,
        }
        set((s) => ({ customProjects: [...s.customProjects, project] }))
        return id
      },
      updateBrand: (id, patch) => {
        set((s) => {
          if (s.customBrands.some((b) => b.id === id)) {
            return { customBrands: s.customBrands.map((b) => (b.id === id ? { ...b, ...patch } : b)) }
          }
          return { brandOverrides: { ...s.brandOverrides, [id]: { ...s.brandOverrides[id], ...patch } } }
        })
      },
      updateProject: (id, patch) => {
        set((s) => {
          if (s.customProjects.some((p) => p.id === id)) {
            return {
              customProjects: s.customProjects.map((p) => {
                if (p.id !== id) return p
                const next: Project = { ...p }
                if (patch.nome !== undefined) next.nome = patch.nome
                if (patch.cidade !== undefined) next.cidade = patch.cidade
                if (patch.brandId !== undefined) next.brandId = patch.brandId
                if (patch.logo !== undefined) next.logo = patch.logo
                if (patch.wallpaper !== undefined) next.wallpaper = patch.wallpaper ?? undefined
                if (patch.status !== undefined) next.status = patch.status
                return next
              }),
            }
          }
          return { projectOverrides: { ...s.projectOverrides, [id]: { ...s.projectOverrides[id], ...patch } } }
        })
      },
      addLocalizacao: (projetoId, nome) => {
        const nomeTrim = nome.trim()
        if (!nomeTrim) return
        set((s) => {
          const atuais = s.customLocalizacoes[projetoId] ?? []
          const taken = new Set(atuais.map((l) => l.id))
          const loc: Localizacao = { id: uniqueLocId(taken), nome: nomeTrim, status: 'Ativo' }
          return { customLocalizacoes: { ...s.customLocalizacoes, [projetoId]: [...atuais, loc] } }
        })
      },
      renameLocalizacao: (projetoId, locId, nome) => {
        const nomeTrim = nome.trim()
        if (!nomeTrim) return
        set((s) => ({
          customLocalizacoes: {
            ...s.customLocalizacoes,
            [projetoId]: (s.customLocalizacoes[projetoId] ?? []).map((l) => (l.id === locId ? { ...l, nome: nomeTrim } : l)),
          },
        }))
      },
      toggleLocalizacaoStatus: (projetoId, locId) => {
        set((s) => ({
          customLocalizacoes: {
            ...s.customLocalizacoes,
            [projetoId]: (s.customLocalizacoes[projetoId] ?? []).map((l) =>
              l.id === locId ? { ...l, status: l.status === 'Inativo' ? 'Ativo' : 'Inativo' } : l,
            ),
          },
        }))
      },
      removeLocalizacao: (projetoId, locId) => {
        set((s) => ({
          customLocalizacoes: {
            ...s.customLocalizacoes,
            [projetoId]: (s.customLocalizacoes[projetoId] ?? []).filter((l) => l.id !== locId),
          },
        }))
      },
    }),
    { name: 'itsm-catalog-v2' },
  ),
)

/** Mapa combinado de marcas de fábrica + criadas pelo admin, indexado por id — com edições aplicadas. */
export function useAllBrandsMap(): Record<string, Brand> {
  const custom = useCatalogStore((s) => s.customBrands)
  const overrides = useCatalogStore((s) => s.brandOverrides)
  const merged: Record<string, Brand> = { ...BRANDS, ...Object.fromEntries(custom.map((b) => [b.id, b])) }
  for (const [id, patch] of Object.entries(overrides)) {
    if (merged[id]) merged[id] = { ...merged[id], ...patch }
  }
  return merged
}

export function useBrand(id: string): Brand {
  const map = useAllBrandsMap()
  return map[id] ?? BRANDS.planneta
}

/** Mapa combinado de temas (paleta do shell) de fábrica + criados pelo admin — recalcula a paleta
 * quando a cor principal de uma marca de fábrica é editada. */
export function useAllThemesMap(): Record<string, ProjectTheme> {
  const custom = useCatalogStore((s) => s.customThemes)
  const overrides = useCatalogStore((s) => s.brandOverrides)
  const merged: Record<string, ProjectTheme> = { ...PROJECT_THEMES, ...custom }
  for (const [id, patch] of Object.entries(overrides)) {
    const base = merged[id]
    if (!base) continue
    const label = patch.nome ?? base.label
    const logo = patch.logo ?? base.logo
    if (patch.cor) {
      merged[id] = { label, logo, medio: patch.cor, ...derivePalette(patch.cor) }
    } else if (patch.nome || patch.logo) {
      merged[id] = { ...base, label, logo }
    }
  }
  return merged
}

export function useProjectTheme(id: string): ProjectTheme {
  const map = useAllThemesMap()
  return map[id] ?? PROJECT_THEMES.planneta
}

/** Lista combinada de entidades de fábrica + criadas pelo admin — com edições aplicadas. */
export function useAllProjects(): Project[] {
  const custom = useCatalogStore((s) => s.customProjects)
  const overrides = useCatalogStore((s) => s.projectOverrides)
  const base = [...PROJECTS, ...custom]
  return base.map((p) => {
    const patch = overrides[p.id]
    if (!patch) return p
    const { wallpaper, ...rest } = patch
    const merged: Project = { ...p, ...rest }
    if (wallpaper !== undefined) merged.wallpaper = wallpaper ?? undefined
    return merged
  })
}

/** Ids de todas as marcas conhecidas (de fábrica + admin), na ordem de criação. */
export function useAllBrandIds(): string[] {
  // seleciona o array bruto (referência estável entre renders) — mapear dentro do
  // seletor retornaria uma referência nova a cada chamada e causaria loop de render
  const customBrands = useCatalogStore((s) => s.customBrands)
  return [...Object.keys(PROJECT_THEMES), ...customBrands.map((b) => b.id)]
}

/** Entidades com status Ativo cuja empresa mantenedora também está Ativa — a lista "para começar a
 * trabalhar" usada no picker pós-login e no campo Projeto/Localidade de Novo Atendimento. Uma entidade
 * inativada continua existindo (histórico, chamados, usuários) e visível em useAllProjects(); só some
 * daqui. */
export function useProjetosSelecionaveis(): Project[] {
  const all = useAllProjects()
  const brandsMap = useAllBrandsMap()
  return all.filter((p) => (p.status ?? 'Ativo') === 'Ativo' && (brandsMap[p.brandId]?.status ?? 'Ativo') === 'Ativo')
}

/** Localizações reais de uma entidade (todas, inclusive inativas) — cadastradas em Administração →
 * Entidades. Usado na tela de administração; para o campo Localização de Novo Atendimento, ver
 * useLocalizacoesDoProjeto. */
export function useLocalizacoesEntidade(projetoId: string): Localizacao[] {
  return useCatalogStore((s) => s.customLocalizacoes[projetoId] ?? [])
}

/** Nomes das localizações Ativas de uma entidade, para o campo Localização de Novo Atendimento;
 * enquanto nenhuma estiver Ativa, cai na lista de teste — igual para todas as entidades até cadastrar
 * a primeira real. */
export function useLocalizacoesDoProjeto(projetoId: string): string[] {
  const custom = useCatalogStore((s) => s.customLocalizacoes[projetoId])
  const ativas = custom?.filter((l) => l.status === 'Ativo').map((l) => l.nome) ?? []
  return ativas.length ? ativas : LOCALIZACOES_TESTE
}
