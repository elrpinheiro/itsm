import type { Project } from '@/types'
import euTenhoFuturo from '@/assets/logos/eu-tenho-futuro.jpg'
import educaTaboao from '@/assets/logos/educataboao.png'
import educacaoAcolhedora from '@/assets/logos/educacaoacolhedora.png'
import nucleoInovacao from '@/assets/logos/nucleoinovacao.png'
import escolaFuturoCacapava from '@/assets/logos/escolafuturocacapava.png'
import infanciaConectada from '@/assets/logos/infanciaconectaserranegra.png'
import escolaFuturoPortoFeliz from '@/assets/logos/escolafuturaportofeliz.png'
import incluirCerquilho from '@/assets/logos/incluircerquilho.png'
import conectarRioClaro from '@/assets/logos/conectarrioclaro.jpg'
import conectaOz from '@/assets/logos/conectaoz-osasco.png'
import espacoIntec from '@/assets/logos/espacointec.png'
import educamundiLogo from '@/assets/logos/educamundi.png'
import educaJuquitiba from '@/assets/logos/educajuquitiba.png'

export const PROJECTS: Project[] = [
  {
    id: 'osasco-eu-tenho-futuro',
    cidade: 'Osasco',
    nome: 'Eu Tenho Futuro',
    brandId: 'planneta',
    logo: euTenhoFuturo,
  },
  {
    id: 'taboao-da-serra-educataboao',
    cidade: 'Taboão da Serra',
    nome: 'EducaTaboão',
    brandId: 'planneta',
    logo: educaTaboao,
  },
  {
    id: 'marilia-educacao-acolhedora',
    cidade: 'Marília',
    nome: 'Educação Acolhedora',
    brandId: 'planneta',
    logo: educacaoAcolhedora,
  },
  {
    id: 'ubatuba-nucleo-inovacao',
    cidade: 'Ubatuba',
    nome: 'Núcleo de Inovação Tecnológico',
    brandId: 'faz',
    logo: nucleoInovacao,
  },
  {
    id: 'cacapava-escola-futuro',
    cidade: 'Caçapava',
    nome: 'Escola do Futuro',
    brandId: 'faz',
    logo: escolaFuturoCacapava,
  },
  {
    id: 'serra-negra-infancia-conectada',
    cidade: 'Serra Negra',
    nome: 'Infância Conectada',
    brandId: 'faz',
    logo: infanciaConectada,
  },
  {
    id: 'porto-feliz-escola-futuro',
    cidade: 'Porto Feliz',
    nome: 'Escola do Futuro',
    brandId: 'faz',
    logo: escolaFuturoPortoFeliz,
  },
  {
    id: 'cerquilho-incluir-tecnologico',
    cidade: 'Cerquilho',
    nome: 'Incluir Tecnológico',
    brandId: 'faz',
    logo: incluirCerquilho,
  },
  {
    id: 'rio-claro-conectar-educacao',
    cidade: 'Rio Claro',
    nome: 'Conectar Educação',
    brandId: 'faz',
    logo: conectarRioClaro,
  },
  {
    id: 'osasco-conectaoz',
    cidade: 'Osasco',
    nome: 'ConectaOZ',
    brandId: 'faz',
    logo: conectaOz,
  },
  {
    id: 'paraty-espaco-intec',
    cidade: 'Paraty',
    nome: 'Espaço Intec — Inclusão e Tecnologia Conectando Futuros',
    brandId: 'faz',
    logo: espacoIntec,
  },
  {
    id: 'juquitiba-educajuquitiba',
    cidade: 'Juquitiba',
    nome: 'EducaJuquitiba',
    brandId: 'faz',
    logo: educaJuquitiba,
  },
  {
    id: 'sjc-fundhas',
    cidade: 'São José dos Campos',
    nome: 'Fundhas',
    brandId: 'educamundi',
    logo: educamundiLogo,
  },
]
