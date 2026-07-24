import { useMemo } from 'react'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { calcularSla, atingiuMeta } from '@/utils/chamadoMetrics'
import type { Chamado, Prioridade } from '@/data/chamados'
import type { Project } from '@/types'

interface Props {
  chamados: Chamado[]
  projetos: Project[]
  ttrMapPorProjeto: Record<string, Partial<Record<Prioridade, number>>>
  metaPercentual: number
}

const COLUMNS: DataTableColumn[] = [
  { key: 'projeto', label: 'Projeto' },
  { key: 'dentroDoPrazo', label: 'Dentro do prazo', width: '130px' },
  { key: 'foraDoPrazo', label: 'Fora do prazo', width: '120px' },
  { key: 'total', label: 'Total elegível', width: '120px' },
  { key: 'percentual', label: '% cumprido', width: '110px' },
  { key: 'situacao', label: 'Meta', width: '190px' },
]

/** Painel de cumprimento de SLA por projeto — quantos chamados foram atendidos dentro do prazo-alvo
 * (TTR) e quantos não foram, comparados contra a meta única (ex.: 85%) definida em Administração →
 * Níveis de Serviço para todos os projetos. Projetos sem SLA configurado aparecem à parte, sem
 * entrar na comparação com a meta. */
export default function SlaComplianceBoard({ chamados, projetos, ttrMapPorProjeto, metaPercentual }: Props) {
  const linhas = useMemo(() => {
    return projetos.map((p) => {
      const label = `${p.nome} — ${p.cidade}`
      const ttrMap = ttrMapPorProjeto[p.id] ?? {}
      const semSla = Object.keys(ttrMap).length === 0
      const doProjeto = chamados.filter((c) => c.projetoNome === label)
      const resumo = calcularSla(doProjeto, (c) => ttrMap[c.prioridade])
      return { projeto: p, label, semSla, resumo, meta: atingiuMeta(resumo, metaPercentual) }
    })
  }, [projetos, chamados, ttrMapPorProjeto, metaPercentual])

  // Projetos com SLA e chamados elegíveis vêm primeiro, piores % primeiro (mais acionável); depois
  // os sem chamados elegíveis ainda; por último, os sem SLA configurado.
  const ordenadas = [...linhas].sort((a, b) => {
    if (a.semSla !== b.semSla) return a.semSla ? 1 : -1
    if (a.resumo.percentual === null && b.resumo.percentual === null) return 0
    if (a.resumo.percentual === null) return 1
    if (b.resumo.percentual === null) return -1
    return a.resumo.percentual - b.resumo.percentual
  })

  const rows = ordenadas.map((l) => ({
    projeto: <b>{l.label}</b>,
    dentroDoPrazo: l.resumo.total - l.resumo.foraDoPrazo,
    foraDoPrazo: l.resumo.foraDoPrazo,
    total: l.resumo.total,
    percentual: l.resumo.percentual === null ? '—' : `${l.resumo.percentual}%`,
    situacao: l.semSla ? (
      <span className="badge">Sem SLA configurado</span>
    ) : l.meta === null ? (
      <span className="badge">Sem chamados ainda</span>
    ) : l.meta ? (
      <span className="badge badge-green">✓ Meta atingida</span>
    ) : (
      <span className="badge badge-red">✗ Abaixo da meta</span>
    ),
  }))

  const columns = COLUMNS.map((c) => (c.key === 'situacao' ? { ...c, label: `Meta (${metaPercentual}%)` } : c))

  return (
    <div className="table-scroll">
      <DataTable columns={columns} rows={rows} emptyText="Nenhum projeto cadastrado." />
    </div>
  )
}
