import * as XLSX from 'xlsx'
import { atingiuMeta, atingiuMetaBacklog, calcularBacklog, calcularSla } from './chamadoMetrics'
import type { Chamado, Prioridade, StatusChamado } from '@/data/chamados'
import type { Project } from '@/types'

function labelDoProjeto(p: Project): string {
  return `${p.nome} — ${p.cidade}`
}

export interface LinhaChamadosPorProjeto {
  projeto: string
  total: number
  naFila: number
  emAtendimento: number
  processandoPlanejado: number
  aguardandoTerceiro: number
  pendenteFornecedor: number
  pendenteClienteColaborador: number
  solucionado: number
  fechado: number
  [key: string]: unknown
}

/** Uma linha por projeto com a contagem de chamados por status — base do relatório "Chamados por
 * projeto" (export CSV/Excel) e reaproveitável por qualquer outra tela que precise do mesmo corte. */
export function linhasChamadosPorProjeto(chamados: Chamado[], projetos: Project[]): LinhaChamadosPorProjeto[] {
  return projetos.map((p) => {
    const label = labelDoProjeto(p)
    const doProjeto = chamados.filter((c) => c.projetoNome === label)
    const contar = (s: StatusChamado) => doProjeto.filter((c) => c.status === s).length
    return {
      projeto: label,
      total: doProjeto.length,
      naFila: contar('Na fila'),
      emAtendimento: contar('Em atendimento'),
      processandoPlanejado: contar('Processando (planejado)'),
      aguardandoTerceiro: contar('Aguardando terceiro'),
      pendenteFornecedor: contar('Pendente Fornecedor'),
      pendenteClienteColaborador: contar('Pendente Cliente/Colaborador'),
      solucionado: contar('Solucionado'),
      fechado: contar('Fechado'),
    }
  })
}

export interface LinhaSlaPorProjeto {
  projeto: string
  dentroDoPrazo: number
  foraDoPrazo: number
  totalElegivel: number
  percentualCumprido: number | null
  situacao: string
  [key: string]: unknown
}

/** Uma linha por projeto com o cumprimento de SLA — mesmo cálculo usado no painel "Cumprimento de
 * SLA por projeto" (SlaComplianceBoard), reaproveitado aqui para o export CSV/Excel. */
export function linhasSlaPorProjeto(
  chamados: Chamado[],
  projetos: Project[],
  ttrMapPorProjeto: Record<string, Partial<Record<Prioridade, number>>>,
  metaPercentual: number,
): LinhaSlaPorProjeto[] {
  return projetos.map((p) => {
    const label = labelDoProjeto(p)
    const ttrMap = ttrMapPorProjeto[p.id] ?? {}
    const semSla = Object.keys(ttrMap).length === 0
    const doProjeto = chamados.filter((c) => c.projetoNome === label)
    const resumo = calcularSla(doProjeto, (c) => ttrMap[c.prioridade])
    const meta = atingiuMeta(resumo, metaPercentual)
    const situacao = semSla ? 'Sem SLA configurado' : meta === null ? 'Sem chamados elegíveis' : meta ? 'Meta atingida' : 'Abaixo da meta'
    return {
      projeto: label,
      dentroDoPrazo: resumo.total - resumo.foraDoPrazo,
      foraDoPrazo: resumo.foraDoPrazo,
      totalElegivel: resumo.total,
      percentualCumprido: resumo.percentual,
      situacao,
    }
  })
}

export interface LinhaBacklogPorProjeto {
  projeto: string
  backlog: number
  abertosNoMes: number
  percentualBacklog: number | null
  situacao: string
  [key: string]: unknown
}

/** Uma linha por projeto com o backlog frente aos chamados abertos no mês — mesmo cálculo usado no
 * painel "Backlog por projeto" (BacklogBoard), reaproveitado aqui para o export CSV/Excel. */
export function linhasBacklogPorProjeto(chamados: Chamado[], projetos: Project[], metaPercentual: number): LinhaBacklogPorProjeto[] {
  return projetos.map((p) => {
    const label = labelDoProjeto(p)
    const doProjeto = chamados.filter((c) => c.projetoNome === label)
    const resumo = calcularBacklog(doProjeto)
    const meta = atingiuMetaBacklog(resumo, metaPercentual)
    const situacao = meta === null ? 'Sem chamados no mês' : meta ? 'Meta atingida' : 'Abaixo da meta'
    return {
      projeto: label,
      backlog: resumo.backlog,
      abertosNoMes: resumo.abertosNoMes,
      percentualBacklog: resumo.percentual,
      situacao,
    }
  })
}

export interface RelatorioColuna {
  key: string
  label: string
}

function escapeCsv(valor: unknown): string {
  const texto = valor === null || valor === undefined ? '' : String(valor)
  if (/[",;\n]/.test(texto)) return `"${texto.replace(/"/g, '""')}"`
  return texto
}

function baixarBlob(blob: Blob, nomeArquivo: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nomeArquivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Exporta linhas para CSV (separador ";", compatível com Excel em pt-BR) — baixa direto no
 * navegador, sem passar por servidor (não há backend nesta versão do sistema). */
export function exportarCsv(colunas: RelatorioColuna[], linhas: Record<string, unknown>[], nomeArquivo: string) {
  const cabecalho = colunas.map((c) => escapeCsv(c.label)).join(';')
  const corpo = linhas.map((linha) => colunas.map((c) => escapeCsv(linha[c.key])).join(';')).join('\n')
  const blob = new Blob([`﻿${cabecalho}\n${corpo}`], { type: 'text/csv;charset=utf-8;' })
  baixarBlob(blob, `${nomeArquivo}.csv`)
}

/** Exporta linhas para uma planilha Excel (.xlsx), uma aba só — baixa direto no navegador via
 * SheetJS (xlsx), sem passar por servidor. */
export function exportarXlsx(colunas: RelatorioColuna[], linhas: Record<string, unknown>[], nomeArquivo: string) {
  const dados = linhas.map((linha) => Object.fromEntries(colunas.map((c) => [c.label, linha[c.key] ?? ''])))
  const planilha = XLSX.utils.json_to_sheet(dados, { header: colunas.map((c) => c.label) })
  const livro = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(livro, planilha, 'Relatório')
  XLSX.writeFile(livro, `${nomeArquivo}.xlsx`)
}
