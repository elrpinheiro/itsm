import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Brand, Project, ProjectTheme } from '@/types'
import { BRANDS } from '@/data/brands'
import { PROJECT_THEMES } from '@/data/projectThemes'
import { PROJECTS } from '@/data/projects'
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

interface CatalogState {
  customBrands: Brand[]
  customThemes: Record<string, ProjectTheme>
  customProjects: Project[]
  addBrand: (input: AddBrandInput) => string
  addProject: (input: AddProjectInput) => string
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
    }),
    { name: 'itsm-catalog' },
  ),
)

/** Mapa combinado de marcas de fábrica + criadas pelo admin, indexado por id. */
export function useAllBrandsMap(): Record<string, Brand> {
  const custom = useCatalogStore((s) => s.customBrands)
  return { ...BRANDS, ...Object.fromEntries(custom.map((b) => [b.id, b])) }
}

export function useBrand(id: string): Brand {
  const map = useAllBrandsMap()
  return map[id] ?? BRANDS.planneta
}

/** Mapa combinado de temas (paleta do shell) de fábrica + criados pelo admin. */
export function useAllThemesMap(): Record<string, ProjectTheme> {
  const custom = useCatalogStore((s) => s.customThemes)
  return { ...PROJECT_THEMES, ...custom }
}

export function useProjectTheme(id: string): ProjectTheme {
  const map = useAllThemesMap()
  return map[id] ?? PROJECT_THEMES.planneta
}

/** Lista combinada de projetos de fábrica + criados pelo admin. */
export function useAllProjects(): Project[] {
  const custom = useCatalogStore((s) => s.customProjects)
  return [...PROJECTS, ...custom]
}

/** Ids de todas as marcas conhecidas (de fábrica + admin), na ordem de criação. */
export function useAllBrandIds(): string[] {
  // seleciona o array bruto (referência estável entre renders) — mapear dentro do
  // seletor retornaria uma referência nova a cada chamada e causaria loop de render
  const customBrands = useCatalogStore((s) => s.customBrands)
  return [...Object.keys(PROJECT_THEMES), ...customBrands.map((b) => b.id)]
}
