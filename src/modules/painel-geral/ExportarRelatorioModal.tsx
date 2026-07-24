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

const TIPOS: { valor: TipoRelatorio; label: string; descricao: string }[] = [
  { valor: 'chamados', label: 'Chamados por projeto', descricao: 'Total de chamados por projeto, aberto por status.' },
  { valor: 'sla', label: 'SLAs vencidos e cumpridos', descricao: 'Cumprimento de SLA por projeto — dentro e fora do prazo.' },
  { valor: 'backlog', label: 'Backlog por projeto', descricao: 'Backlog (em aberto) frente aos chamados abertos no mês, por projeto.' },
]

const COLUNAS_CHAMADOS: RelatorioColuna[] = [
  { key: 'projeto', label: 'Projeto' },
  { key: 'total', label: 'Total' },
  { key: 'naFila', label: 'Na fila' },
  { key: 'emAtendimento', label: 'Em atendimento' },
  { key: 'processandoPlanejado', label: 'Processando (planejado)' },
  { key: 'aguardandoTerceiro', label: 'Aguardando terceiro' },
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

/** Modal de exportação de relatórios (CSV/Excel) a partir do Painel Geral — reaproveita exatamente
 * os mesmos cálculos por projeto exibidos nos painéis de SLA e Backlog, para os números baterem com
 * o que já está na tela. Tudo gerado no navegador, sem backend nesta versão do sistema. */
export default function ExportarRelatorioModal({
  chamados,
  projetos,
  ttrMapPorProjeto,
  metaSlaPercentual,
  metaBacklogPercentual,
  onClose,
}: Props) {
  const [tipo, setTipo] = useState<TipoRelatorio>('chamados')

  function montar(): { colunas: RelatorioColuna[]; linhas: Record<string, unknown>[]; nomeArquivo: string } {
    const hoje = new Date().toISOString().slice(0, 10)
    if (tipo === 'sla') {
      return {
        colunas: COLUNAS_SLA,
        linhas: linhasSlaPorProjeto(chamados, projetos, ttrMapPorProjeto, metaSlaPercentual),
        nomeArquivo: `slas-vencidos-e-cumpridos-${hoje}`,
      }
    }
    if (tipo === 'backlog') {
      return {
        colunas: COLUNAS_BACKLOG,
        linhas: linhasBacklogPorProjeto(chamados, projetos, metaBacklogPercentual),
        nomeArquivo: `backlog-por-projeto-${hoje}`,
      }
    }
    return {
      colunas: COLUNAS_CHAMADOS,
      linhas: linhasChamadosPorProjeto(chamados, projetos),
      nomeArquivo: `chamados-por-projeto-${hoje}`,
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
          {TIPOS.map((t) => (
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
        O relatório reflete o período selecionado no Painel Geral e soma todos os projetos.
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
