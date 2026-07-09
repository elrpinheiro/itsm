export default function BaseConhecimentoModule() {
  return (
    <div className="empty-box">
      <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Base de Conhecimento</div>
      <div style={{ fontSize: 13, color: 'var(--texto-sec)', lineHeight: 1.6 }}>
        Em construção. Aqui entrarão artigos, procedimentos e soluções para consulta rápida da equipe.
      </div>
      <span className="badge badge-amber" style={{ marginTop: 14 }}>
        Em breve
      </span>
    </div>
  )
}
