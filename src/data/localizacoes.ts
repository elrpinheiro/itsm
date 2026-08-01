/** Localizações de teste — mock temporário até a lista real de localizações de cada projeto ser
 * fornecida. Usada igual para todos os projetos por enquanto (a função já recebe o id do projeto
 * para, no futuro, trocar por um lookup real por projeto sem mudar quem a chama). */
const LOCALIZACOES_TESTE: string[] = ['Localização Teste 1', 'Localização Teste 2', 'Localização Teste 3']

export function localizacoesDoProjeto(_projetoId: string): string[] {
  return LOCALIZACOES_TESTE
}
