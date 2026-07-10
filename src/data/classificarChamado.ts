import type { CatalogItem, ClassificationLabel } from './catalog'
import type { Prioridade } from './chamados'

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g')

function normalizar(texto: string): string {
  return texto.trim().toLowerCase().normalize('NFD').replace(COMBINING_DIACRITICS, '')
}

/** Sinônimos por item de catálogo — cobre como um requerente descreveria o problema com as próprias palavras. */
const SINONIMOS: Record<string, string[]> = {
  notebook: ['notebook', 'laptop', 'computador', 'pc'],
  internet: ['internet', 'wifi', 'wi-fi', 'rede'],
  'impressora/scanner': ['impressora', 'imprimir', 'scanner', 'digitalizar'],
  impressora: ['impressora', 'imprimir', 'scanner', 'digitalizar'],
  'furto/roubo': ['furto', 'roubo', 'roubad', 'sumiu', 'desapareceu'],
  ipad: ['ipad'],
  tablet: ['tablet'],
  'smart tv': ['tv', 'televisao'],
  projetor: ['projetor'],
  cameras: ['camera'],
  'kit limpeza': ['limpeza'],
  'gabinete de recarga': ['gabinete', 'recarga', 'carregador', 'carregar'],
  'dúvidas/sugestões/elogios ou reclamações': ['duvida', 'sugestao', 'elogio', 'reclamacao'],
  'empréstimo de equipamentos': ['emprestimo'],
  'apple tv': ['apple tv'],
}

export interface ClassificacaoSugerida {
  categoria: string
  tipoAtendimento: ClassificationLabel
  prioridade: Prioridade
  grupoId: string
}

/**
 * Sugestão de classificação a partir da descrição do atendimento — um classificador determinístico
 * por palavra-chave, não um modelo de IA real (ver seção de limitações conhecidas na documentação
 * técnica). Funciona como um "stand-in" simples até haver integração com um classificador real.
 */
export function classificarAtendimento(descricaoBruta: string, catalog: CatalogItem[] | undefined): ClassificacaoSugerida {
  const texto = normalizar(descricaoBruta)

  let categoria = catalog?.[0]?.label ?? 'Outros'
  if (catalog && texto) {
    for (const item of catalog) {
      const chaveItem = normalizar(item.label)
      const variantes = SINONIMOS[chaveItem] ?? [normalizar(item.label.split('/')[0])]
      if (variantes.some((v) => texto.includes(v))) {
        categoria = item.label
        break
      }
    }
  }

  let tipoAtendimento: ClassificationLabel = 'Requisição'
  if (/nao liga|nao funciona|parou|quebrad|danificad|trincad|rachad|sem acesso|fora do ar|caiu/.test(texto)) {
    tipoAtendimento = 'Incidente'
  } else if (/atualiz|migrar|nova versao|trocar servidor|configurar.*novo/.test(texto)) {
    tipoAtendimento = 'Habilitação de Mudanças'
  } else if (/de novo|novamente|sempre|toda semana|recorrente/.test(texto)) {
    tipoAtendimento = 'Problema'
  }

  let prioridade: Prioridade = 'Média'
  if (/nao liga|sem acesso|parou tudo|urgente|critic/.test(texto)) {
    prioridade = 'Crítica'
  } else if (/nao funciona|quebrad|danificad|sem internet|fora do ar/.test(texto)) {
    prioridade = 'Alta'
  } else if (/duvida|sugestao|elogio|gostaria de saber/.test(texto)) {
    prioridade = 'Baixa'
  }

  let grupoId = 'grp-n1'
  const categoriaNorm = normalizar(categoria)
  if (/duvida|sugestao|elogio|reclamacao|furto|roubo/.test(categoriaNorm)) {
    grupoId = 'grp-central-atendimento'
  } else if (tipoAtendimento === 'Incidente' || tipoAtendimento === 'Problema') {
    grupoId = 'grp-n2'
  }

  return { categoria, tipoAtendimento, prioridade, grupoId }
}

/** Limpeza leve de texto (espaços, maiúscula inicial, ponto final) — não é reescrita generativa real. */
export function reformularDescricao(textoBruto: string): string {
  let t = textoBruto.trim().replace(/\s+/g, ' ')
  if (!t) return t
  t = t.charAt(0).toUpperCase() + t.slice(1)
  if (!/[.!?]$/.test(t)) t += '.'
  return t
}
