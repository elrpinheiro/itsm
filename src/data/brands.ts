import type { Brand, BrandId } from '@/types'

export const BRANDS: Record<BrandId, Brand> = {
  planneta: {
    id: 'planneta',
    nome: 'Planneta Educação',
    razaoSocial: 'Planeta Educação Gráfica e Editora Ltda.',
    cor: '#0D2B5E',
    badgeClass: 'badge-blue',
  },
  faz: {
    id: 'faz',
    nome: 'Faz Educação',
    razaoSocial: 'Faz Educação & Tecnologia',
    cor: '#1E7A45',
    badgeClass: 'badge-green',
  },
}

export const BRAND_LIST: Brand[] = Object.values(BRANDS)
