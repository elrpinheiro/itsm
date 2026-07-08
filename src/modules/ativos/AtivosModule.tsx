import { useState } from 'react'
import SectionSidebarLayout, { type SectionSidebarItem } from '@/components/layout/SectionSidebarLayout'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { COMPUTADORES, DISPOSITIVOS_REDE, MONITORES, SOFTWARES, PERIFERICOS, IMPRESSORAS, TELEFONES } from '@/data/ativosMock'

type Section = 'computadores' | 'rede' | 'monitores' | 'softwares' | 'perifericos' | 'impressoras' | 'telefones'

const ITEMS: SectionSidebarItem[] = [
  { key: 'computadores', label: 'Computadores', icon: '🖥️' },
  { key: 'rede', label: 'Dispositivos de Rede', icon: '📡' },
  { key: 'monitores', label: 'Monitores', icon: '🖵' },
  { key: 'softwares', label: 'Softwares/Licenças', icon: '💽' },
  { key: 'perifericos', label: 'Periféricos', icon: '🖱️' },
  { key: 'impressoras', label: 'Impressoras', icon: '🖨️' },
  { key: 'telefones', label: 'Telefones', icon: '☎️' },
]

function statusBadge(status: string) {
  const cls = status === 'Em uso' || status === 'Ativo' ? 'badge-green' : status === 'Manutenção' ? 'badge-amber' : ''
  const style = status === 'Em estoque' || status === 'Inativo' || status === 'Sem suprimento' ? { background: '#f1efee', color: '#5a4a3f' } : undefined
  return (
    <span className={`badge ${cls}`} style={style}>
      {status}
    </span>
  )
}

const COMPUTADORES_COLUMNS: DataTableColumn[] = [
  { key: 'patrimonio', label: 'Patrimônio', width: '130px' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'projeto', label: 'Projeto/Local' },
  { key: 'status', label: 'Status', width: '110px' },
]

const REDE_COLUMNS: DataTableColumn[] = [
  { key: 'patrimonio', label: 'Patrimônio', width: '130px' },
  { key: 'tipo', label: 'Tipo', width: '130px' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'local', label: 'Local' },
  { key: 'status', label: 'Status', width: '90px' },
]

const MONITORES_COLUMNS: DataTableColumn[] = [
  { key: 'patrimonio', label: 'Patrimônio', width: '130px' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'projeto', label: 'Projeto/Local' },
  { key: 'status', label: 'Status', width: '110px' },
]

const SOFTWARES_COLUMNS: DataTableColumn[] = [
  { key: 'software', label: 'Software' },
  { key: 'tipoLicenca', label: 'Tipo de licença' },
  { key: 'quantidade', label: 'Quantidade', width: '110px' },
  { key: 'vencimento', label: 'Vencimento', width: '130px' },
]

const PERIFERICOS_COLUMNS: DataTableColumn[] = [
  { key: 'patrimonio', label: 'Patrimônio', width: '130px' },
  { key: 'item', label: 'Item' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'projeto', label: 'Projeto/Local' },
]

const IMPRESSORAS_COLUMNS: DataTableColumn[] = [
  { key: 'patrimonio', label: 'Patrimônio', width: '130px' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'local', label: 'Local' },
  { key: 'contador', label: 'Contador', width: '120px' },
  { key: 'status', label: 'Status', width: '130px' },
]

const TELEFONES_COLUMNS: DataTableColumn[] = [
  { key: 'numero', label: 'Número/Ramal', width: '150px' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'usuario', label: 'Usuário' },
  { key: 'projeto', label: 'Projeto/Local' },
]

export default function AtivosModule() {
  const [active, setActive] = useState<Section>('computadores')

  return (
    <SectionSidebarLayout title="Ativos" items={ITEMS} active={active} onSelect={(k) => setActive(k as Section)}>
      <div className="mod-scroll-area">
        {active === 'computadores' && (
          <>
            <div className="mod-section-title">Computadores</div>
            <DataTable
              columns={COMPUTADORES_COLUMNS}
              rows={COMPUTADORES.map((c) => ({ patrimonio: <b>{c.patrimonio}</b>, modelo: c.modelo, usuario: c.usuario, projeto: c.projeto, status: statusBadge(c.status) }))}
            />
          </>
        )}

        {active === 'rede' && (
          <>
            <div className="mod-section-title">Dispositivos de rede</div>
            <DataTable
              columns={REDE_COLUMNS}
              rows={DISPOSITIVOS_REDE.map((d) => ({ patrimonio: <b>{d.patrimonio}</b>, tipo: d.tipo, modelo: d.modelo, local: d.local, status: statusBadge(d.status) }))}
            />
          </>
        )}

        {active === 'monitores' && (
          <>
            <div className="mod-section-title">Monitores</div>
            <DataTable
              columns={MONITORES_COLUMNS}
              rows={MONITORES.map((m) => ({ patrimonio: <b>{m.patrimonio}</b>, modelo: m.modelo, usuario: m.usuario, projeto: m.projeto, status: statusBadge(m.status) }))}
            />
          </>
        )}

        {active === 'softwares' && (
          <>
            <div className="mod-section-title">Softwares/Licenças</div>
            <DataTable
              columns={SOFTWARES_COLUMNS}
              rows={SOFTWARES.map((s) => ({ software: <b>{s.software}</b>, tipoLicenca: s.tipoLicenca, quantidade: s.quantidade, vencimento: s.vencimento }))}
            />
          </>
        )}

        {active === 'perifericos' && (
          <>
            <div className="mod-section-title">Periféricos</div>
            <DataTable
              columns={PERIFERICOS_COLUMNS}
              rows={PERIFERICOS.map((p) => ({ patrimonio: <b>{p.patrimonio}</b>, item: p.item, usuario: p.usuario, projeto: p.projeto }))}
            />
          </>
        )}

        {active === 'impressoras' && (
          <>
            <div className="mod-section-title">Impressoras</div>
            <DataTable
              columns={IMPRESSORAS_COLUMNS}
              rows={IMPRESSORAS.map((i) => ({ patrimonio: <b>{i.patrimonio}</b>, modelo: i.modelo, local: i.local, contador: i.contador, status: statusBadge(i.status) }))}
            />
          </>
        )}

        {active === 'telefones' && (
          <>
            <div className="mod-section-title">Telefones</div>
            <DataTable
              columns={TELEFONES_COLUMNS}
              rows={TELEFONES.map((t) => ({ numero: <b>{t.numero}</b>, modelo: t.modelo, usuario: t.usuario, projeto: t.projeto }))}
            />
          </>
        )}
      </div>
    </SectionSidebarLayout>
  )
}
