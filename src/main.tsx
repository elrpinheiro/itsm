import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, MemoryRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'

function suportaHistoryApi(): boolean {
  // Um replaceState que só muda o hash não dispara o SecurityError, mas trocar o pathname
  // dispara — e é isso que o BrowserRouter faz de verdade ao navegar entre rotas. Por isso o
  // probe precisa trocar o pathname (não só o hash) para refletir o caso real, revertendo em
  // seguida. Em iframes sandboxed com origem opaca (ex.: artifacts embarcados), isso lança
  // SecurityError; sem essa checagem o BrowserRouter quebra o app antes de renderizar.
  const original = window.location.href
  try {
    window.history.replaceState(window.history.state, '', '/__router_probe__')
    window.history.replaceState(window.history.state, '', original)
    return true
  } catch {
    return false
  }
}

const Router = suportaHistoryApi() ? BrowserRouter : MemoryRouter

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>,
)
