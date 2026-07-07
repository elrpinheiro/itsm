export default function AssistenciaModule() {
  return (
    <div className="empty-box">
      <div style={{ fontSize: 40, marginBottom: 12 }}>🛠</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Módulo Assistência</div>
      <div style={{ fontSize: 13, color: 'var(--texto-sec)', lineHeight: 1.6 }}>
        Em construção. Aqui entrarão requisições, incidentes e problemas integrados ao GLPI, com o
        plugin Vitae de ações contextuais.
      </div>
      <span className="badge badge-amber" style={{ marginTop: 14 }}>
        Em breve
      </span>
    </div>
  )
}
