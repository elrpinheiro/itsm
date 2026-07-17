import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  CHAMADOS,
  type Chamado,
  type InteracaoChamado,
  type OrigemAtendimento,
  type Prioridade,
  type StatusChamado,
} from '@/data/chamados'
import type { ClassificationLabel } from '@/data/catalog'

export interface AddChamadoInput {
  projetoNome: string
  assunto: string
  prioridade: Prioridade
  descricao: string
  solicitanteEmail: string
  categoria: string
  tipoAtendimento: ClassificationLabel
  grupoId: string
  origem: OrigemAtendimento
  vinculados: string[]
  /** true = "Chamado solucionado? Sim" — fecha na hora com a ação como resolução. */
  resolvidoNaHora: boolean
  acaoRealizada?: string
  linkedId?: string
  gravacaoUrl?: string
  protocoloWhatsapp?: string
  ativosVinculados?: string[]
}

export interface AcompanhamentoInput {
  texto: string
  autor: string
  origem: OrigemAtendimento
  publico: boolean
}

interface ChamadosState {
  chamados: Chamado[]
  addChamado: (input: AddChamadoInput) => string
  /** Técnico assume o chamado — "Na fila" → "Em atendimento" (Processing assigned no GLPI). */
  assumirChamado: (numero: string, tecnico: string) => void
  /** Acompanhamento (troca com o requerente, público ou privado) — não muda o status: dá para
   * interagir com o chamado ainda "Na fila", antes de alguém assumi-lo formalmente. */
  adicionarAcompanhamento: (numero: string, input: AcompanhamentoInput) => void
  /** Tarefa técnica agendada — vira uma nota na timeline (Processing planned do GLPI fica dentro do
   * nosso "Em atendimento", ver comentário em StatusChamado). */
  agendarTarefa: (numero: string, texto: string, autor: string) => void
  /** Requerente indisponível ou chamado incompleto — "Aguardando terceiro" (Pending do GLPI). */
  colocarPendente: (numero: string, motivo: string, autor: string) => void
  retomarChamado: (numero: string, autor: string) => void
  /** Técnico registra a solução — vira "Solucionado", aguardando o aceite (assinatura) do requerente. */
  registrarSolucao: (numero: string, texto: string, autor: string) => void
  /** Aceite/assinatura do requerente confirmados — fecha o chamado. */
  confirmarAssinatura: (numero: string) => void
  /** Requerente rejeita a solução — reabre o chamado para o técnico. */
  rejeitarSolucao: (numero: string, motivo: string, autor: string) => void
}

function proximoNumero(chamados: Chamado[]): string {
  const maior = chamados.reduce((max, c) => {
    const n = parseInt(c.numero.replace('#', ''), 10)
    return Number.isNaN(n) ? max : Math.max(max, n)
  }, 10000)
  return `#${maior + 1}`
}

function criarInteracao(input: Omit<InteracaoChamado, 'id' | 'criadoEm'>): InteracaoChamado {
  return { ...input, id: crypto.randomUUID(), criadoEm: 'agora mesmo' }
}

/** Aplica uma atualização a um chamado pelo número, anexando opcionalmente uma interação nova à
 * timeline — helper único para não repetir o `map` em cada ação de ciclo de vida. */
function atualizarChamado(
  chamados: Chamado[],
  numero: string,
  patch: Partial<Chamado>,
  interacao?: Omit<InteracaoChamado, 'id' | 'criadoEm'>,
): Chamado[] {
  return chamados.map((c) =>
    c.numero === numero
      ? { ...c, ...patch, interacoes: interacao ? [...(c.interacoes ?? []), criarInteracao(interacao)] : c.interacoes }
      : c,
  )
}

/** Fila de chamados do sistema — inclui o catálogo mockado inicial e os chamados abertos em sessão via o fluxo de Novo Chamado. */
export const useChamadosStore = create<ChamadosState>()(
  persist(
    (set, get) => ({
      chamados: CHAMADOS,
      addChamado: (input) => {
        const numero = proximoNumero(get().chamados)
        const status: StatusChamado = input.resolvidoNaHora ? 'Fechado' : 'Na fila'
        const chamado: Chamado = {
          numero,
          projetoNome: input.projetoNome,
          assunto: input.descricao.slice(0, 80),
          prioridade: input.prioridade,
          status,
          abertoHa: 'agora mesmo',
          solicitanteEmail: input.solicitanteEmail,
          categoria: input.categoria,
          tipoAtendimento: input.tipoAtendimento,
          grupoId: input.grupoId,
          origem: input.origem,
          descricao: input.descricao,
          acaoRealizada: input.acaoRealizada || undefined,
          vinculados: input.vinculados.length ? input.vinculados : undefined,
          linkedId: input.linkedId || undefined,
          gravacaoUrl: input.gravacaoUrl || undefined,
          protocoloWhatsapp: input.protocoloWhatsapp || undefined,
          ativosVinculados: input.ativosVinculados?.length ? input.ativosVinculados : undefined,
        }
        set((s) => ({ chamados: [...s.chamados, chamado] }))
        return numero
      },
      assumirChamado: (numero, tecnico) =>
        set((s) => ({
          chamados: atualizarChamado(s.chamados, numero, { status: 'Em atendimento', atribuidoA: tecnico }, {
            tipo: 'sistema',
            origem: 'Sistema',
            publico: true,
            autor: tecnico,
            texto: `${tecnico} assumiu o chamado.`,
          }),
        })),
      adicionarAcompanhamento: (numero, input) =>
        set((s) => ({
          chamados: atualizarChamado(s.chamados, numero, {}, {
            tipo: 'acompanhamento',
            origem: input.origem,
            publico: input.publico,
            autor: input.autor,
            texto: input.texto,
          }),
        })),
      agendarTarefa: (numero, texto, autor) =>
        set((s) => ({
          chamados: atualizarChamado(s.chamados, numero, {}, { tipo: 'tarefa', origem: 'Atendente', publico: true, autor, texto }),
        })),
      colocarPendente: (numero, motivo, autor) =>
        set((s) => ({
          chamados: atualizarChamado(s.chamados, numero, { status: 'Aguardando terceiro' }, {
            tipo: 'sistema',
            origem: 'Sistema',
            publico: true,
            autor,
            texto: `Chamado colocado em pendência: ${motivo}`,
          }),
        })),
      retomarChamado: (numero, autor) =>
        set((s) => ({
          chamados: atualizarChamado(s.chamados, numero, { status: 'Em atendimento' }, {
            tipo: 'sistema',
            origem: 'Sistema',
            publico: true,
            autor,
            texto: `${autor} retomou o atendimento.`,
          }),
        })),
      registrarSolucao: (numero, texto, autor) =>
        set((s) => ({
          chamados: atualizarChamado(
            s.chamados,
            numero,
            { status: 'Solucionado', acaoRealizada: texto, assinaturaStatus: 'pendente' },
            { tipo: 'solucao', origem: 'Atendente', publico: true, autor, texto },
          ),
        })),
      confirmarAssinatura: (numero) =>
        set((s) => ({
          chamados: atualizarChamado(s.chamados, numero, { status: 'Fechado', assinaturaStatus: 'assinada' }, {
            tipo: 'sistema',
            origem: 'Sistema',
            publico: true,
            autor: 'Sistema',
            texto: 'Chamado fechado — solução validada e assinada pelo requerente.',
          }),
        })),
      rejeitarSolucao: (numero, motivo, autor) =>
        set((s) => ({
          chamados: atualizarChamado(
            s.chamados,
            numero,
            { status: 'Em atendimento', assinaturaStatus: 'rejeitada' },
            { tipo: 'sistema', origem: 'Sistema', publico: true, autor, texto: `Solução rejeitada pelo requerente — chamado reaberto: ${motivo}` },
          ),
        })),
    }),
    { name: 'itsm-chamados-v2' },
  ),
)
