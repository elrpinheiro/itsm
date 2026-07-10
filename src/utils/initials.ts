/** Deriva as iniciais (até 2 letras) de um nome completo — ex.: "Isadora Pinheiro" → "IP". */
export function initialsFromName(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return ''
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}
