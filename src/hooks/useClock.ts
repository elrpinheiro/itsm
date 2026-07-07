import { useEffect, useState } from 'react'

function formatNow() {
  const n = new Date()
  return `${n.toLocaleDateString('pt-BR')} · ${n.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })}`
}

/** Relógio exibido na barra superior, atualizado a cada 30s como no protótipo. */
export function useClock() {
  const [now, setNow] = useState(formatNow)
  useEffect(() => {
    const id = setInterval(() => setNow(formatNow()), 30000)
    return () => clearInterval(id)
  }, [])
  return now
}
