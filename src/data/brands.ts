import type { Brand, BrandId } from '@/types'
import plannetaLogo from '@/assets/logos/planneta-educacao.png'
import fazLogo from '@/assets/logos/faz-educacao.png'
import educamundiLogo from '@/assets/logos/educamundi.png'

export const BRANDS: Record<BrandId, Brand> = {
  planneta: {
    id: 'planneta',
    nome: 'Planneta Educação',
    razaoSocial: 'Planeta Educação Gráfica e Editora Ltda.',
    cor: '#0D2B5E',
    badgeClass: 'badge-blue',
    logo: plannetaLogo,
  },
  faz: {
    id: 'faz',
    nome: 'Faz Educação',
    razaoSocial: 'Faz Educação & Tecnologia',
    cor: '#1E7A45',
    badgeClass: 'badge-green',
    logo: fazLogo,
  },
  educamundi: {
    id: 'educamundi',
    nome: 'Educamundi',
    razaoSocial: 'Educamundi Soluções Educacionais Ltda.',
    cor: '#3A1850',
    badgeClass: 'badge-purple',
    logo: educamundiLogo,
  },
}

export const BRAND_LIST: Brand[] = Object.values(BRANDS)
