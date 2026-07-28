import { useEffect, useMemo, useState } from 'react'
import { User, Building2, Phone, MessageCircle, Keyboard } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { badgeStyleFromColor } from '@/utils/color'
import { STATUS_PENDENTES, type Chamado, type OrigemAtendimento } from '@/data/chamados'

export type FiltroTab = 'todos' | 'novos' | 'andamento' | 'pendentes' | 'solucionados' | 'fechados'

interface Props {
  chamados: Chamado[]
  onOpenChamado: (numero: string) => void
  /** Mostra a unidade/projeto em cada card — só faz sentido na visão global (vários projetos juntos). */
  showProjeto?: boolean
  /** Aba inicial (ex.: chegando de um KPI do dashboard com "?tab=novos") — os cliques do usuário
   * dentro da lista continuam controlando a aba normalmente depois disso. */
  initialTab?: FiltroTab
}

const TABS: { key: FiltroTab; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'novos', label: 'Novos' },
  { key: 'andamento', label: 'Em andamento' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'solucionados', label: 'Solucionados' },
  { key: 'fechados', label: 'Fechados' },
]

const ORIGEM_ICON: Record<OrigemAtendimento, typeof User> = {
  Atendente: Keyboard,
  '0800 (URA)': Phone,
  WhatsApp: MessageCircle,
}

export function statusParaTab(status: Chamado['status']): FiltroTab | null {
  if (status === 'Na fila') return 'novos'
  if (status === 'Em atendimento' || status === 'Processando (planejado)') return 'andamento'
  if (STATUS_PENDENTES.includes(status)) return 'pendentes'
  if (status === 'Solucionado') return 'solucionados'
  if (status === 'Fechado') return 'fechados'
  return null
}

/** Fila de chamados em cards (não tabela) — clique em qualquer card abre o detalhe/timeline do
 * chamado. Compartilhado entre a visão por projeto e a visão global de Assistência. */
export default function FilaChamadosList({ chamados, onOpenChamado, showProjeto = false, initialTab }: Props) {
  const usuarios = useAdminStore((s) => s.usuarios)
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))
  const origemLabels = Object.fromEntries(useDropdownEntries('origem').map((e) => [e.chave, e.label]))
  const [tab, setTab] = useState<FiltroTab>(initialTab ?? 'todos')
  const [busca, setBusca] = useState('')

  // Chegando de um KPI do dashboard (ex.: "Fechados"), a aba deve refletir o novo destino mesmo se
  // a lista já estava montada — sem isso, um segundo clique no mesmo KPI a partir de outra tela não
  // atualizaria a aba selecionada.
  useEffect(() => {
    if (initialTab) setTab(initialTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTab])

  const filtrados = useMemo(() => {
    let lista = chamados
    if (tab !== 'todos') lista = lista.filter((c) => statusParaTab(c.status) === tab)
    if (busca.trim()) {
      const q = busca.trim().toLowerCase()
      lista = lista.filter((c) => c.numero.toLowerCase().includes(q) || c.assunto.toLowerCase().includes(q))
    }
    return lista
  }, [chamados, tab, busca])

  function requerenteLabel(c: Chamado): string {
    if (!c.solicitanteEmail) return '—'
    return usuarios.find((u) => u.email === c.solicitanteEmail)?.nome ?? c.solicitanteEmail
  }

  return (
    <div>
      <div className="chq-toolbar">
        <div className="chq-tabs">
          {TABS.map((t) => (
            <button key={t.key} type="button" className={`chip${tab === t.key ? ' on' : ''}`} onClick={() => setTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="chq-search"
          placeholder="Buscar chamado…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {filtrados.length === 0 && <div className="chq-empty">Nenhum chamado encontrado.</div>}

      <div className="chq-list">
        {filtrados.map((c) => {
          const status = statusMap[c.status]
          const OrigemIcon = c.origem ? ORIGEM_ICON[c.origem] : null
          return (
            <div key={c.numero} className="chq-card" onClick={() => onOpenChamado(c.numero)}>
              <div className="chq-card-main">
                <div className="chq-card-top">
                  <span className="chq-status-dot" style={{ background: status?.cor ?? '#5f5e5a' }} />
                  <span className="chq-numero">{c.numero}</span>
                </div>
                <div className="chq-titulo">{c.assunto}</div>
                <div className="chq-meta-row">
                  <span>
                    <User size={13} /> {requerenteLabel(c)}
                  </span>
                  {showProjeto && (
                    <span>
                      <Building2 size={13} /> {c.projetoNome}
                    </span>
                  )}
                  {c.origem && OrigemIcon && (
                    <span>
                      <OrigemIcon size={13} /> {origemLabels[c.origem] ?? c.origem}
                    </span>
                  )}
                </div>
              </div>
              <span className="badge chq-card-badge" style={badgeStyleFromColor(status?.cor ?? '#5f5e5a')}>
                {status?.label ?? c.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
