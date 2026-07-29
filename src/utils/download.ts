declare global {
  interface Window {
    claude?: {
      downloads?: {
        save: (request: { filename: string; data: Blob }) => Promise<{ status: 'saved' }>
      }
    }
  }
}

/** Baixa um arquivo (URL de asset ou data: URI) com o nome informado. Dentro do Artifact publicado
 * (claude.ai), usa a API window.claude.downloads (o preview do Artifact roda em sandbox e bloqueia
 * o download direto via <a download>); fora dele — app real hospedado — cai no <a download> normal. */
export async function baixarArquivo(url: string, nomeArquivo: string): Promise<void> {
  if (window.claude?.downloads) {
    try {
      const resposta = await fetch(url)
      const blob = await resposta.blob()
      await window.claude.downloads.save({ filename: nomeArquivo, data: blob })
      return
    } catch {
      // segue para o fallback abaixo (ex.: extensão não habilitada, viewer recusou, etc.)
    }
  }
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
