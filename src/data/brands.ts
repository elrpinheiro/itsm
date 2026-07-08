import type { Brand, BrandId } from '@/types'
import plannetaLogo from '@/assets/logos/planneta-educacao.png'
import fazLogo from '@/assets/logos/faz-educacao.png'
import educamundiLogo from '@/assets/logos/educamundi.png'
import planetaProjetosLogo from '@/assets/logos/planeta-projetos.png'
import solumLogo from '@/assets/logos/solum.png'
import albertLogo from '@/assets/logos/albert.png'
import vitaeBrasilLogo from '@/assets/logos/vitae-brasil.png'

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
  'planeta-projetos': {
    id: 'planeta-projetos',
    nome: 'Planeta Projetos',
    razaoSocial: 'Planeta Projetos Ltda.',
    cor: '#633F32',
    logo: planetaProjetosLogo,
  },
  solum: {
    id: 'solum',
    nome: 'Solum Ambiental',
    razaoSocial: 'Solum Waste Solution Ambiental Ltda.',
    cor: '#008137',
    logo: solumLogo,
  },
  albert: {
    id: 'albert',
    nome: 'Albert',
    razaoSocial: 'Albert Ltda.',
    cor: '#E5004C',
    logo: albertLogo,
  },
  'vitae-brasil': {
    id: 'vitae-brasil',
    nome: 'Vitae Brasil',
    razaoSocial: 'Vitae Brasil Soluções Inteligentes Ltda.',
    cor: '#005CAA',
    logo: vitaeBrasilLogo,
  },
}

export const BRAND_LIST: Brand[] = Object.values(BRANDS)
