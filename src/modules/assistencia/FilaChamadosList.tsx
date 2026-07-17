import { useMemo, useState } from 'react'
import { User, Building2, Phone, MessageCircle, Keyboard } from 'lucide-react'
import { useAdminStore } from '@/store/useAdminStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { badgeStyleFromColor } from '@/utils/color'
import type { Chamado, OrigemAtendimento } from '@/data/chamados'

interface Props {
  chamados: Chamado[]
  onOpenChamado: (numero: string) => void
  /** Mostra a unidade/projeto em cada card — só faz sentido na visão global (vários projetos juntos). */
  showProjeto?: boolean
}

type FiltroTab = 'todos' | 'novos' | 'andamento' | 'pendentes' | 'solucionados'

const TABS: { key: FiltroTab; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'novos', label: 'Novos' },
  { key: 'andamento', label: 'Em andamento' },
  { key: 'pendentes', label: 'Pendentes' },
  { key: 'solucionados', label: 'Solucionados' },
]

const ORIGEM_ICON: Record<OrigemAtendimento, typeof User> = {
  Atendente: Keyboard,
  '0800 (URA)': Phone,
  WhatsApp: MessageCircle,
}

function statusParaTab(status: Chamado['status']): FiltroTab | null {
  if (status === 'Na fila') return 'novos'
  if (status === 'Em atendimento' || status === 'Processando (planejado)') return 'andamento'
  if (status === 'Aguardando terceiro') return 'pendentes'
  if (status === 'Solucionado') return 'solucionados'
  return null
}

/** Fila de chamados em cards (não tabela) — clique em qualquer card abre o detalhe/timeline do
 * chamado. Compartilhado entre a visão por projeto e a visão global de Assistência. */
export default function FilaChamadosList({ chamados, onOpenChamado, showProjeto = false }: Props) {
  const usuarios = useAdminStore((s) => s.usuarios)
  const statusMap = Object.fromEntries(useDropdownEntries('status').map((e) => [e.chave, e]))
  const origemLabels = Object.fromEntries(useDropdownEntries('origem').map((e) => [e.chave, e.label]))
  const [tab, setTab] = useState<FiltroTab>('todos')
  const [busca, setBusca] = useState('')

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
