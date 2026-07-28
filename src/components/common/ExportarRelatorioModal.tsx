import { useState } from 'react'
import Modal from '@/components/common/Modal'
import {
  exportarCsv,
  exportarXlsx,
  linhasBacklogPorProjeto,
  linhasChamadosPorProjeto,
  linhasSlaPorProjeto,
  type RelatorioColuna,
} from '@/utils/relatorios'
import type { Chamado, Prioridade } from '@/data/chamados'
import type { Project } from '@/types'

interface Props {
  chamados: Chamado[]
  projetos: Project[]
  ttrMapPorProjeto: Record<string, Partial<Record<Prioridade, number>>>
  metaSlaPercentual: number
  metaBacklogPercentual: number
  onClose: () => void
}

type TipoRelatorio = 'chamados' | 'sla' | 'backlog'

function tiposRelatorio(escopoUnico: Project | null): { valor: TipoRelatorio; label: string; descricao: string }[] {
  return [
    {
      valor: 'chamados',
      label: escopoUnico ? 'Chamados' : 'Chamados por projeto',
      descricao: escopoUnico ? 'Total de chamados, aberto por status.' : 'Total de chamados por projeto, aberto por status.',
    },
    { valor: 'sla', label: 'SLAs vencidos e cumpridos', descricao: 'Cumprimento de SLA por projeto — dentro e fora do prazo.' },
    { valor: 'backlog', label: 'Backlog por projeto', descricao: 'Backlog (em aberto) frente aos chamados abertos no mês, por projeto.' },
  ]
}

const COLUNAS_CHAMADOS: RelatorioColuna[] = [
  { key: 'projeto', label: 'Projeto' },
  { key: 'total', label: 'Total' },
  { key: 'naFila', label: 'Na fila' },
  { key: 'emAtendimento', label: 'Em atendimento' },
  { key: 'processandoPlanejado', label: 'Processando (planejado)' },
  { key: 'aguardandoTerceiro', label: 'Aguardando terceiro' },
  { key: 'pendenteFornecedor', label: 'Pendente Fornecedor' },
  { key: 'pendenteClienteColaborador', label: 'Pendente Cliente/Colaborador' },
  { key: 'solucionado', label: 'Solucionado' },
  { key: 'fechado', label: 'Fechado' },
]

const COLUNAS_SLA: RelatorioColuna[] = [
  { key: 'projeto', label: 'Projeto' },
  { key: 'dentroDoPrazo', label: 'Dentro do prazo' },
  { key: 'foraDoPrazo', label: 'Fora do prazo' },
  { key: 'totalElegivel', label: 'Total elegível' },
  { key: 'percentualCumprido', label: '% cumprido' },
  { key: 'situacao', label: 'Situação' },
]

const COLUNAS_BACKLOG: RelatorioColuna[] = [
  { key: 'projeto', label: 'Projeto' },
  { key: 'backlog', label: 'Backlog (em aberto)' },
  { key: 'abertosNoMes', label: 'Abertos no mês' },
  { key: 'percentualBacklog', label: '% backlog' },
  { key: 'situacao', label: 'Situação' },
]

/** Modal de exportação de relatórios (CSV/Excel) — usado tanto no Painel Geral (todos os projetos)
 * quanto no Início de um projeto específico (só `projetos` com aquele projeto). Reaproveita
 * exatamente os mesmos cálculos por projeto exibidos nos painéis de SLA e Backlog, para os números
 * baterem com o que já está na tela. Tudo gerado no navegador, sem backend nesta versão do sistema. */
export default function ExportarRelatorioModal({
  chamados,
  projetos,
  ttrMapPorProjeto,
  metaSlaPercentual,
  metaBacklogPercentual,
  onClose,
}: Props) {
  const [tipo, setTipo] = useState<TipoRelatorio>('chamados')
  const escopoUnico = projetos.length === 1 ? projetos[0] : null
  const sufixoArquivo = escopoUnico ? `-${escopoUnico.cidade.toLowerCase().replace(/\s+/g, '-')}` : ''
  const tipos = tiposRelatorio(escopoUnico)

  function montar(): { colunas: RelatorioColuna[]; linhas: Record<string, unknown>[]; nomeArquivo: string } {
    const hoje = new Date().toISOString().slice(0, 10)
    if (tipo === 'sla') {
      return {
        colunas: COLUNAS_SLA,
        linhas: linhasSlaPorProjeto(chamados, projetos, ttrMapPorProjeto, metaSlaPercentual),
        nomeArquivo: `slas-vencidos-e-cumpridos${sufixoArquivo}-${hoje}`,
      }
    }
    if (tipo === 'backlog') {
      return {
        colunas: COLUNAS_BACKLOG,
        linhas: linhasBacklogPorProjeto(chamados, projetos, metaBacklogPercentual),
        nomeArquivo: `backlog-por-projeto${sufixoArquivo}-${hoje}`,
      }
    }
    return {
      colunas: COLUNAS_CHAMADOS,
      linhas: linhasChamadosPorProjeto(chamados, projetos),
      nomeArquivo: `${escopoUnico ? 'chamados' : 'chamados-por-projeto'}${sufixoArquivo}-${hoje}`,
    }
  }

  function handleCsv() {
    const { colunas, linhas, nomeArquivo } = montar()
    exportarCsv(colunas, linhas, nomeArquivo)
  }

  function handleXlsx() {
    const { colunas, linhas, nomeArquivo } = montar()
    exportarXlsx(colunas, linhas, nomeArquivo)
  }

  return (
    <Modal title="Exportar relatório" onClose={onClose}>
      <div className="frow">
        <label className="field-label">Tipo de relatório</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tipos.map((t) => (
            <label
              key={t.valor}
              style={{
                display: 'flex',
                gap: 10,
                alignItems: 'flex-start',
                border: '1px solid var(--borda)',
                borderRadius: 8,
                padding: '9px 12px',
                cursor: 'pointer',
                background: tipo === t.valor ? 'var(--tema-pale)' : 'var(--card)',
                borderColor: tipo === t.valor ? 'var(--tema)' : 'var(--borda)',
              }}
            >
              <input type="radio" name="tipo-relatorio" checked={tipo === t.valor} onChange={() => setTipo(t.valor)} style={{ marginTop: 3 }} />
              <span>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.label}</div>
                <div style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>{t.descricao}</div>
              </span>
            </label>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--texto-sec)', margin: '10px 0 14px' }}>
        {escopoUnico
          ? `O relatório reflete o período selecionado e só os dados de ${escopoUnico.nome} — ${escopoUnico.cidade}.`
          : 'O relatório reflete o período selecionado e soma todos os projetos.'}
      </div>
      <div className="admin-form-actions">
        <button type="button" className="btn" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn" onClick={handleCsv}>
          ⬇ Baixar CSV
        </button>
        <button type="button" className="btn btn-primary" onClick={handleXlsx}>
          ⬇ Baixar Excel
        </button>
      </div>
    </Modal>
  )
}
