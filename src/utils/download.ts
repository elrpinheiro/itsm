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
 * (claude.ai), usa a API window.claude.downloads — o preview roda em sandbox e bloqueia o download
 * direto via <a download>, inclusive navegando a própria página para a data: URI (fica com "cara" de
 * página vazia, já que o navegador não sabe renderizar um .docx). Por isso, se window.claude.downloads
 * existe mas o save() falha (ex.: extensão .docx não liberada neste preview), NÃO cai no <a> — isso só
 * pioraria a experiência. Só usa o <a download> clássico quando window.claude nem existe, ou seja, fora
 * do preview (app hospedado normalmente), onde já é o método testado e funcional. */
export async function baixarArquivo(url: string, nomeArquivo: string): Promise<void> {
  const downloads = window.claude?.downloads
  if (downloads) {
    try {
      const resposta = await fetch(url)
      const blob = await resposta.blob()
      await downloads.save({ filename: nomeArquivo, data: blob })
    } catch (erro) {
      const codigo = (erro as { code?: string } | undefined)?.code
      if (codigo === 'declined') return
      window.alert(
        'Não foi possível baixar este arquivo neste preview — o tipo de documento pode não estar liberado aqui. Abra o app publicado fora do preview do Claude para baixar normalmente.',
      )
    }
    return
  }
  const link = document.createElement('a')
  link.href = url
  link.download = nomeArquivo
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
