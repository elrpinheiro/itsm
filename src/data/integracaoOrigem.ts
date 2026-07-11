/**
 * Integrações simuladas por origem do atendimento — Linkedid (0800/URA) e Protocolo (WhatsApp) não
 * chamam nenhuma API de telefonia ou mensageria real. Servem como "stand-in" do fluxo esperado (o
 * atendente informa o código, o sistema localiza a gravação/conversa e anexa ao chamado) até existir
 * uma integração de fato com a central telefônica (Vtcall) e o WhatsApp Business (MKTZAP).
 */

export interface GravacaoURA {
  url: string
  duracao: string
}

/** Localiza (de forma simulada) a gravação da ligação a partir do Linkedid informado pelo atendente. */
export function buscarGravacaoURA(linkedId: string): GravacaoURA | null {
  const limpo = linkedId.trim()
  if (!limpo) return null
  const duracoes = ['1m54s', '2m37s', '3m12s', '4m05s', '2m48s']
  const indice = limpo.split('').reduce((soma, ch) => soma + ch.charCodeAt(0), 0) % duracoes.length
  return {
    url: `https://vtcall.vitaebrasil.com.br/gravacoes/${encodeURIComponent(limpo)}.mp3`,
    duracao: duracoes[indice],
  }
}

/** Importa (de forma simulada) a conversa de WhatsApp a partir do protocolo informado pelo atendente. */
export function buscarConversaWhatsApp(protocolo: string): string | null {
  const limpo = protocolo.trim()
  if (!limpo) return null
  return `Conversa importada do protocolo ${limpo} — o requerente relatou o problema pelo WhatsApp e aguarda retorno do atendimento.`
}
