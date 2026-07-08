import type { ProjectBrandId, ProjectTheme } from '@/types'
import plannetaLogo from '@/assets/logos/planneta-educacao.png'
import fazLogo from '@/assets/logos/faz-educacao.png'
import educamundiLogo from '@/assets/logos/educamundi.png'

/**
 * Paleta de cada organização mantenedora, usada para tematizar o shell (header,
 * barra de módulos, botões) quando um projeto daquela marca está selecionado.
 * Planneta e Faz reaproveitam exatamente as cores já usadas nos templates da
 * Central de Documentos; Educamundi é nova e foi extraída do logotipo oficial.
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
}
