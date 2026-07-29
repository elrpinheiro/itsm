export type ClassificationLabel = 'Requisição' | 'Incidente' | 'Problema' | 'Habilitação de Mudanças'

/** Subcategoria (ou sub-subcategoria, quando aninhada de novo) de um item de catálogo. */
export interface CatalogSubItem {
  label: string
  subitens?: CatalogSubItem[]
}

export interface CatalogItem {
  icon: string
  label: string
  /** Subcategorias do item — opcional; a maioria dos projetos ainda usa só o nível de categoria. */
  subitens?: CatalogSubItem[]
}

/**
 * Catálogo de itens de atendimento por projeto — extraído do catálogo real enviado
 * (Faz Educação e Planeta). Ainda é majoritariamente uma lista simples (ícone + rótulo); a
 * granularidade de sub-item por categoria (`subitens`) só foi detalhada para os projetos que já
 * enviaram a árvore completa (ex.: ConectaOZ — Osasco).
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
  // Faz Educação — Serra Negra
  'serra-negra-infancia-conectada': [
    { icon: '📱', label: 'iPad' },
    { icon: '🤝', label: 'Empréstimo de equipamentos' },
    { icon: '🖨️', label: 'Impressora' },
    { icon: '📶', label: 'Internet' },
    { icon: '🍎', label: 'Apple TV' },
    { icon: '💬', label: 'Dúvidas/sugestões/elogios ou reclamações' },
    { icon: '📢', label: 'Furto/roubo' },
    { icon: '🔌', label: 'Gabinete de recarga' },
    { icon: '🧴', label: 'Kit limpeza' },
    { icon: '💻', label: 'Notebook' },
    { icon: '📺', label: 'Smart TV' },
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
  // Faz Educação — Osasco (ConectaOZ)
  'osasco-conectaoz': [
    {
      icon: '🎒',
      label: 'Kit Educacional',
      subitens: [
        { label: 'Agendamento Retirada' },
        { label: 'Devolução' },
        { label: 'Devoluções/Manutenções' },
        { label: 'Dúvidas' },
        { label: 'Usuário sem Cadastro' },
      ],
    },
    {
      icon: '🔧',
      label: 'Manutenção',
      subitens: [{ label: 'Manutenção' }],
    },
    {
      icon: '📶',
      label: 'Modem/Chip',
      subitens: [
        { label: 'Configurar wifi' },
        { label: 'Danificado' },
        { label: 'Dúvidas', subitens: [{ label: 'Consulta de Chamado' }] },
        { label: 'Esqueceu a Senha' },
        { label: 'Lentidão/Travando' },
        { label: 'Não Liga' },
        { label: 'Perda/Furto' },
        { label: 'Portabilidade CHIP' },
      ],
    },
    {
      icon: '💻',
      label: 'Notebook',
      subitens: [
        { label: 'Configuração de Rede' },
        { label: 'Danificado' },
        { label: 'Dúvidas', subitens: [{ label: 'Consulta chamados' }] },
        { label: 'Dúvidas de Acesso' },
        { label: 'Lentidão/Travando' },
        { label: 'Não Liga' },
        { label: 'Perda/Furto' },
      ],
    },
    {
      icon: '🖱️',
      label: 'Periféricos',
      subitens: [
        { label: 'Dúvidas' },
        { label: 'Fonte - Não funciona' },
        { label: 'Headset - Danificado' },
        { label: 'Headset - Não funciona' },
        { label: 'Mouse - Danificado' },
        { label: 'Mouse - Não funciona' },
        { label: 'Perda/Furto' },
      ],
    },
    {
      icon: '🖥️',
      label: 'Sistema Cliente (Remote Desktop)',
      subitens: [
        { label: 'Inacessível' },
        { label: 'Manutenção Programada' },
        { label: 'Reinstalação do Arlequim' },
        { label: 'Sem atalhos' },
        { label: 'Sem Permissão de Acesso' },
      ],
    },
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
  // Planneta Educação — Taboão da Serra (EducaTaboão) — mesmo catálogo do Eu Tenho Futuro (Osasco)
  'taboao-da-serra-educataboao': [
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
