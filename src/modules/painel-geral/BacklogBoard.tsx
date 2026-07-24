import { useMemo } from 'react'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { calcularBacklog, atingiuMetaBacklog } from '@/utils/chamadoMetrics'
import type { Chamado } from '@/data/chamados'
import type { Project } from '@/types'

interface Props {
  chamados: Chamado[]
  projetos: Project[]
  metaPercentual: number
}

const COLUMNS: DataTableColumn[] = [
  { key: 'projeto', label: 'Projeto' },
  { key: 'backlog', label: 'Backlog (em aberto)', width: '150px' },
  { key: 'abertosNoMes', label: 'Abertos no mês', width: '130px' },
  { key: 'percentual', label: '% backlog', width: '110px' },
  { key: 'situacao', label: 'Meta', width: '190px' },
]

/** Painel de backlog por projeto — quantos chamados ainda estão em aberto (não solucionados nem
 * fechados) frente ao volume de chamados abertos no mês corrente, comparado contra a meta única
 * (ex.: 10%) definida em Administração → Níveis de Serviço para todos os projetos. Diferente do
 * cumprimento de SLA, aqui "dentro da meta" é ficar em ou abaixo do percentual, não acima. */
export default function BacklogBoard({ chamados, projetos, metaPercentual }: Props) {
  const linhas = useMemo(() => {
    return projetos.map((p) => {
      const label = `${p.nome} — ${p.cidade}`
      const doProjeto = chamados.filter((c) => c.projetoNome === label)
      const resumo = calcularBacklog(doProjeto)
      return { projeto: p, label, resumo, meta: atingiuMetaBacklog(resumo, metaPercentual) }
    })
  }, [projetos, chamados, metaPercentual])

  // Piores % primeiro (mais acionável); projetos sem chamados abertos no mês (nada para comparar) ficam por último.
  const ordenadas = [...linhas].sort((a, b) => {
    if (a.resumo.percentual === null && b.resumo.percentual === null) return 0
    if (a.resumo.percentual === null) return 1
    if (b.resumo.percentual === null) return -1
    return b.resumo.percentual - a.resumo.percentual
  })

  const rows = ordenadas.map((l) => ({
    projeto: <b>{l.label}</b>,
    backlog: l.resumo.backlog,
    abertosNoMes: l.resumo.abertosNoMes,
    percentual: l.resumo.percentual === null ? '—' : `${l.resumo.percentual}%`,
    situacao:
      l.meta === null ? (
        <span className="badge">Sem chamados no mês</span>
      ) : l.meta ? (
        <span className="badge badge-green">✓ Meta atingida</span>
      ) : (
        <span className="badge badge-red">✗ Abaixo da meta</span>
      ),
  }))

  const columns = COLUMNS.map((c) => (c.key === 'situacao' ? { ...c, label: `Meta (≤${metaPercentual}%)` } : c))

  return (
    <div className="table-scroll">
      <DataTable columns={columns} rows={rows} emptyText="Nenhum projeto cadastrado." />
    </div>
  )
}
