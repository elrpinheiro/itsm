import { normalizar } from './classificarChamado'

export interface ArtigoBaseConhecimento {
  id: string
  categoria: string
  titulo: string
  palavrasChave: string[]
  solucao: string
}

/**
 * Artigos da Base de Conhecimento (seed) — usados para sugerir automaticamente uma solução aplicável
 * quando o atendente marca "Chamado solucionado? Sim". O módulo Base de Conhecimento em si ainda está
 * "Em construção" (sem listagem de artigos); este arquivo é só a fonte de dados por trás da sugestão.
 */
export const BASE_CONHECIMENTO: ArtigoBaseConhecimento[] = [
  {
    id: 'kb-notebook-nao-liga',
    categoria: 'Notebook',
    titulo: 'Notebook não liga / não carrega',
    palavrasChave: ['nao liga', 'carregador', 'bateria', 'carregando'],
    solucao:
      'Testado o carregador em outra tomada e em outro notebook; feita a troca da bateria/fonte em bancada quando identificado desgaste, e novo teste de inicialização antes de devolver o equipamento.',
  },
  {
    id: 'kb-notebook-travando',
    categoria: 'Notebook',
    titulo: 'Notebook travando ou reiniciando sozinho',
    palavrasChave: ['travando', 'trava', 'reiniciando', 'lento', 'lentidao'],
    solucao:
      'Verificado uso de disco/memória, removidos programas desnecessários da inicialização, reinstalado o sistema quando necessário e atualizados os drivers antes de devolver o equipamento.',
  },
  {
    id: 'kb-internet-instavel',
    categoria: 'Internet',
    titulo: 'Internet instável ou sem conexão',
    palavrasChave: ['instavel', 'sem internet', 'wifi', 'conexao', 'rede'],
    solucao:
      'Reiniciado o roteador/switch do setor, verificado o cabeamento e o sinal Wi-Fi no local, e testada a conexão em mais de um dispositivo antes de encerrar o chamado.',
  },
  {
    id: 'kb-impressora-nao-imprime',
    categoria: 'Impressora/Scanner',
    titulo: 'Impressora não imprime ou não é encontrada na rede',
    palavrasChave: ['nao imprime', 'impressora', 'fila de impressao', 'scanner'],
    solucao:
      'Reinstalado o driver da impressora na máquina do usuário, limpa a fila de impressão e testada a impressão/digitalização a partir de outro computador.',
  },
  {
    id: 'kb-ipad-tela',
    categoria: 'iPad',
    titulo: 'iPad com tela danificada ou travando',
    palavrasChave: ['tela', 'trincad', 'travando', 'ipad'],
    solucao:
      'Feito diagnóstico do aparelho, restauração de fábrica quando o problema era de software, e encaminhamento para assistência técnica quando identificado dano físico na tela.',
  },
  {
    id: 'kb-smarttv-sem-sinal',
    categoria: 'Smart TV',
    titulo: 'Smart TV sem sinal ou não liga',
    palavrasChave: ['sem sinal', 'nao liga', 'tv'],
    solucao: 'Verificado cabeamento HDMI/energia, testado o controle remoto e a fonte de sinal, e reiniciada a TV antes de encerrar o chamado.',
  },
  {
    id: 'kb-projetor-sem-imagem',
    categoria: 'Projetor',
    titulo: 'Projetor sem imagem ou lâmpada fraca',
    palavrasChave: ['sem imagem', 'lampada', 'projetor'],
    solucao: 'Testado o cabo de vídeo em outro notebook, verificada a vida útil da lâmpada e realizada a limpeza dos filtros de ventilação do projetor.',
  },
  {
    id: 'kb-duvida-orientacao',
    categoria: 'Dúvidas/sugestões/elogios ou reclamações',
    titulo: 'Dúvida ou solicitação de orientação',
    palavrasChave: ['duvida', 'orientac', 'como fazer'],
    solucao: 'Orientação prestada diretamente ao requerente por telefone/mensagem, com o passo a passo do procedimento solicitado.',
  },
  {
    id: 'kb-emprestimo-equipamento',
    categoria: 'Empréstimo de equipamentos',
    titulo: 'Solicitação de empréstimo de equipamento',
    palavrasChave: ['emprestimo', 'emprestar'],
    solucao: 'Equipamento separado no almoxarifado, conferido o estado de funcionamento e entregue ao requerente mediante termo de responsabilidade.',
  },
]

/**
 * Sugere um artigo da Base de Conhecimento a partir da categoria já classificada e da descrição do
 * atendimento — um cruzamento determinístico por categoria + palavra-chave, não uma busca semântica
 * real. Quando há mais de um artigo para a mesma categoria, desempata pela contagem de palavras-chave
 * encontradas na descrição.
 */
export function buscarSolucaoSugerida(categoria: string, descricao: string): ArtigoBaseConhecimento | null {
  const categoriaNorm = normalizar(categoria)
  const candidatos = BASE_CONHECIMENTO.filter((a) => normalizar(a.categoria) === categoriaNorm)
  if (candidatos.length === 0) return null
  if (candidatos.length === 1) return candidatos[0]

  const texto = normalizar(descricao)
  let melhor = candidatos[0]
  let melhorPontuacao = -1
  for (const artigo of candidatos) {
    const pontuacao = artigo.palavrasChave.filter((p) => texto.includes(normalizar(p))).length
    if (pontuacao > melhorPontuacao) {
      melhorPontuacao = pontuacao
      melhor = artigo
    }
  }
  return melhor
}
