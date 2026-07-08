import type { ProjectBrandId, ProjectTheme } from '@/types'
import plannetaLogo from '@/assets/logos/planneta-educacao.png'
import fazLogo from '@/assets/logos/faz-educacao.png'
import educamundiLogo from '@/assets/logos/educamundi.png'
import planetaProjetosLogo from '@/assets/logos/planeta-projetos.png'
import solumLogo from '@/assets/logos/solum.png'
import albertLogo from '@/assets/logos/albert.png'
import vitaeBrasilLogo from '@/assets/logos/vitae-brasil.png'

/**
 * Paleta de cada organização mantenedora, usada para tematizar o shell (header,
 * barra de módulos, botões) quando um projeto daquela marca está selecionado.
 * Planneta e Faz reaproveitam exatamente as cores já usadas nos templates da
 * Central de Documentos; as demais foram extraídas da cor principal de cada
 * logotipo oficial (mesma fórmula de derivação usada para marcas cadastradas
 * pelo admin, em src/utils/color.ts).
 */
export const PROJECT_THEMES: Record<ProjectBrandId, ProjectTheme> = {
  planneta: {
    label: 'Planneta Educação',
    logo: plannetaLogo,
    escuro: '#0D2B5E',
    medio: '#185FA5',
    pale: '#E6F1FB',
    texto: '#0C447C',
    accento: '#378ADD',
  },
  faz: {
    label: 'Faz Educação & Tecnologia',
    logo: fazLogo,
    escuro: '#0E371F',
    medio: '#1E7A45',
    pale: '#EAF3DE',
    texto: '#27500A',
    accento: '#3FAE68',
  },
  educamundi: {
    label: 'Educamundi',
    logo: educamundiLogo,
    escuro: '#3A1850',
    medio: '#8035B2',
    pale: '#F2EBF7',
    texto: '#5A257D',
    accento: '#2FB6A8',
  },
  'planeta-projetos': {
    label: 'Planeta Projetos',
    logo: planetaProjetosLogo,
    escuro: '#271812',
    medio: '#633F32',
    pale: '#F1EFEE',
    texto: '#190F0B',
    accento: '#9B5941',
  },
  solum: {
    label: 'Solum Ambiental',
    logo: solumLogo,
    escuro: '#002510',
    medio: '#008137',
    pale: '#EAF5EF',
    texto: '#001107',
    accento: '#00C855',
  },
  albert: {
    label: 'Albert',
    logo: albertLogo,
    escuro: '#89002E',
    medio: '#E5004C',
    pale: '#F5EAEE',
    texto: '#750027',
    accento: '#FF2D73',
  },
  'vitae-brasil': {
    label: 'Vitae Brasil',
    logo: vitaeBrasilLogo,
    escuro: '#002A4E',
    medio: '#005CAA',
    pale: '#EAF0F5',
    texto: '#001F3A',
    accento: '#0083F1',
  },
}
