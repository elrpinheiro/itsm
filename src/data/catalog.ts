export type ClassificationLabel = 'Requisição' | 'Incidente' | 'Problema' | 'Habilitação de Mudanças'

export interface CatalogItem {
  icon: string
  label: string
  /** Classificação ITSM do item (Requisição/Incidente/Problema/Habilitação de Mudanças), usada para
   * filtrar o catálogo a partir da legenda. Opcional — itens sem classificação ficam de fora de
   * qualquer filtro até serem cadastrados (piloto: Infância Conectada, Serra Negra). */
  classification?: ClassificationLabel
}

/**
 * Catálogo de itens de atendimento por projeto — extraído do catálogo real enviado
 * (Faz Educação e Planeta). Ainda é uma lista simples (ícone + rótulo); a
 * granularidade de item/sub-item por categoria virá depois, via planilha.
 */
export const PROJECT_CATALOGS: Record<string, CatalogItem[]> = {
  // Faz Educação — Caçapava
  'cacapava-escola-futuro': [
    { icon: '📱', label: 'iPad' },
    { icon: '📶', label: 'Internet' },
    { icon: '📺', label: 'Smart TV' },
    { icon: '🖨️', label: 'Impressora 3D' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '💻', label: 'Notebook' },
    { icon: '🚁', label: 'Drone' },
    { icon: '🥽', label: 'Óculos VR Meta Quest 2' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '🤖', label: 'Robô Dash' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '📢', label: 'Furto/roubo' },
  ],
  // Faz Educação — Cerquilho
  'cerquilho-incluir-tecnologico': [
    { icon: '📱', label: 'iPad' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '📶', label: 'Internet' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '💻', label: 'Notebook' },
  ],
  // Faz Educação — Paraty
  'paraty-espaco-intec': [
    { icon: '📱', label: 'iPad' },
    { icon: '💻', label: 'Notebook' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '📶', label: 'Internet' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '📺', label: 'Smart TV' },
    { icon: '🖥️', label: 'Ambiente Virtual de Aprendizagem' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🧴', label: 'Kit limpeza' },
  ],
  // Faz Educação — Porto Feliz
  'porto-feliz-escola-futuro': [
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '📱', label: 'iPad' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '📶', label: 'Internet' },
    { icon: '🔥', label: 'Máquina de corte a laser' },
    { icon: '💻', label: 'Notebook' },
    { icon: '🚁', label: 'Drone' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🇬', label: 'Google Workspace for Education' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '🖨️', label: 'Impressora 3D' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '📺', label: 'Smart TV' },
  ],
  // Faz Educação — Rio Claro
  'rio-claro-conectar-educacao': [
    { icon: '📱', label: 'iPad' },
    { icon: '📶', label: 'Internet' },
    { icon: '💻', label: 'Notebook' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '🚁', label: 'Drone' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '📺', label: 'Smart TV' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '📡', label: 'Chromecast' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🖨️', label: 'Impressora 3D' },
    { icon: '🤖', label: 'Robô explorador' },
  ],
  // Faz Educação — Serra Negra (piloto: itens classificados para o filtro por legenda)
  'serra-negra-infancia-conectada': [
    { icon: '📱', label: 'iPad', classification: 'Requisição' },
    { icon: '🤝', label: 'Empréstimo de equipamentos', classification: 'Requisição' },
    { icon: '🖨️', label: 'Impressora', classification: 'Incidente' },
    { icon: '📶', label: 'Internet', classification: 'Incidente' },
    { icon: '🍎', label: 'Apple TV', classification: 'Requisição' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações', classification: 'Requisição' },
    { icon: '📢', label: 'Furto/roubo', classification: 'Incidente' },
    { icon: '🔌', label: 'Gabinete de recarga', classification: 'Incidente' },
    { icon: '🧴', label: 'Kit limpeza', classification: 'Requisição' },
    { icon: '💻', label: 'Notebook', classification: 'Incidente' },
    { icon: '📺', label: 'Smart TV', classification: 'Incidente' },
  ],
  // Faz Educação — Ubatuba
  'ubatuba-nucleo-inovacao': [
    { icon: '📱', label: 'iPad' },
    { icon: '📶', label: 'Internet' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '💻', label: 'Notebook' },
    { icon: '📺', label: 'Smart TV' },
  ],
  // Faz Educação — Juquitiba (estrutura com sub-categorias — lista simplificada por ora)
  'juquitiba-educajuquitiba': [
    { icon: '📱', label: 'Aplicativo Faz Educa' },
    { icon: '🌐', label: 'Sistema Educa Juquitiba' },
    { icon: '📓', label: 'Diário escolar' },
    { icon: '📝', label: 'Matrículas' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '👤', label: 'Acessos' },
    { icon: '📖', label: 'Relatórios escolares' },
    { icon: '📋', label: 'Comunicados' },
    { icon: '👍', label: 'Avaliações' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '💻', label: 'Notebook' },
    { icon: '👤', label: 'Registro de funcionários' },
    { icon: '👥', label: 'SAEJUQ' },
    { icon: '🏫', label: 'Secretaria escolar' },
  ],
  // Planeta Educação — Osasco
  'osasco-eu-tenho-futuro': [
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '📱', label: 'iPad' },
    { icon: '📶', label: 'Internet' },
    { icon: '🖨️', label: 'Impressora/Scanner' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '💻', label: 'Notebook' },
    { icon: '📱', label: 'Tablet' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '📷', label: 'Câmeras' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '📽️', label: 'Projetor' },
    { icon: '📺', label: 'Smart TV' },
  ],
}
