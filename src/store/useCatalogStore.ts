import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Brand, Project, ProjectTheme } from '@/types'
import { BRANDS } from '@/data/brands'
import { PROJECT_THEMES } from '@/data/projectThemes'
import { PROJECTS } from '@/data/projects'
import { LOCALIZACOES_TESTE } from '@/data/localizacoes'
import { derivePalette } from '@/utils/color'

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
  brandOverrides: Record<string, Partial<AddBrandInput>>
  deletedBrandIds: string[]
  /** Edições (nome/cidade/logo/marca/wallpaper) sobre projetos de fábrica ou criados pelo admin. */
  projectOverrides: Record<string, Partial<AddProjectInput> & { wallpaper?: string | null }>
  deletedProjectIds: string[]
  /** Localizações reais cadastradas por projeto — substitui a lista de teste (Teste 1/2/3) quando definida. */
  customLocalizacoes: Record<string, string[]>
  addBrand: (input: AddBrandInput) => string
  updateBrand: (id: string, patch: Partial<AddBrandInput>) => void
  deleteBrand: (id: string) => UpdateResult
  addProject: (input: AddProjectInput) => string
  updateProject: (id: string, patch: Partial<AddProjectInput> & { wallpaper?: string | null }) => void
  deleteProject: (id: string) => UpdateResult
  setLocalizacoes: (projetoId: string, lista: string[]) => void
}

/**
 * Empresas e projetos criados pelo administrador em tempo de execução — persistidos
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
      deletedBrandIds: [],
      projectOverrides: {},
      deletedProjectIds: [],
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
      deleteBrand: (id) => {
        const s = get()
        const projetosAtivos = [...PROJECTS, ...s.customProjects].filter((p) => !s.deletedProjectIds.includes(p.id))
        const emUso = projetosAtivos.some((p) => (s.projectOverrides[p.id]?.brandId ?? p.brandId) === id)
        if (emUso) {
          return { ok: false, error: 'Existem projetos vinculados a esta empresa — exclua-os ou troque a empresa mantenedora deles antes.' }
        }
        const isCustom = s.customBrands.some((b) => b.id === id)
        set((st) => ({
          customBrands: st.customBrands.filter((b) => b.id !== id),
          deletedBrandIds: isCustom || st.deletedBrandIds.includes(id) ? st.deletedBrandIds : [...st.deletedBrandIds, id],
          brandOverrides: Object.fromEntries(Object.entries(st.brandOverrides).filter(([k]) => k !== id)),
          customThemes: Object.fromEntries(Object.entries(st.customThemes).filter(([k]) => k !== id)),
        }))
        return { ok: true }
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
                return next
              }),
            }
          }
          return { projectOverrides: { ...s.projectOverrides, [id]: { ...s.projectOverrides[id], ...patch } } }
        })
      },
      deleteProject: (id) => {
        const s = get()
        const isCustom = s.customProjects.some((p) => p.id === id)
        set((st) => ({
          customProjects: st.customProjects.filter((p) => p.id !== id),
          deletedProjectIds: isCustom || st.deletedProjectIds.includes(id) ? st.deletedProjectIds : [...st.deletedProjectIds, id],
          projectOverrides: Object.fromEntries(Object.entries(st.projectOverrides).filter(([k]) => k !== id)),
          customLocalizacoes: Object.fromEntries(Object.entries(st.customLocalizacoes).filter(([k]) => k !== id)),
        }))
        return { ok: true }
      },
      setLocalizacoes: (projetoId, lista) => {
        set((s) => ({ customLocalizacoes: { ...s.customLocalizacoes, [projetoId]: lista } }))
      },
    }),
    { name: 'itsm-catalog' },
  ),
)

/** Mapa combinado de marcas de fábrica + criadas pelo admin, indexado por id — com edições e exclusões aplicadas. */
export function useAllBrandsMap(): Record<string, Brand> {
  const custom = useCatalogStore((s) => s.customBrands)
  const overrides = useCatalogStore((s) => s.brandOverrides)
  const deleted = useCatalogStore((s) => s.deletedBrandIds)
  const merged: Record<string, Brand> = { ...BRANDS, ...Object.fromEntries(custom.map((b) => [b.id, b])) }
  for (const id of deleted) delete merged[id]
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

/** Lista combinada de projetos de fábrica + criados pelo admin — com edições e exclusões aplicadas. */
export function useAllProjects(): Project[] {
  const custom = useCatalogStore((s) => s.customProjects)
  const overrides = useCatalogStore((s) => s.projectOverrides)
  const deleted = useCatalogStore((s) => s.deletedProjectIds)
  const base = [...PROJECTS, ...custom]
  return base
    .filter((p) => !deleted.includes(p.id))
    .map((p) => {
      const patch = overrides[p.id]
      if (!patch) return p
      const { wallpaper, ...rest } = patch
      const merged: Project = { ...p, ...rest }
      if (wallpaper !== undefined) merged.wallpaper = wallpaper ?? undefined
      return merged
    })
}

/** Ids de todas as marcas conhecidas (de fábrica + admin), na ordem de criação — sem as excluídas. */
export function useAllBrandIds(): string[] {
  // seleciona o array bruto (referência estável entre renders) — mapear dentro do
  // seletor retornaria uma referência nova a cada chamada e causaria loop de render
  const customBrands = useCatalogStore((s) => s.customBrands)
  const deleted = useCatalogStore((s) => s.deletedBrandIds)
  const ids = [...Object.keys(PROJECT_THEMES), ...customBrands.map((b) => b.id)]
  return deleted.length ? ids.filter((id) => !deleted.includes(id)) : ids
}

/** Localizações reais de um projeto (cadastradas em Administração → Projeto); enquanto nenhuma for
 * definida, cai na lista de teste — igual para todos os projetos até ser configurada. */
export function useLocalizacoesDoProjeto(projetoId: string): string[] {
  const custom = useCatalogStore((s) => s.customLocalizacoes[projetoId])
  return custom && custom.length ? custom : LOCALIZACOES_TESTE
}
