interface StatTileProps {
  color: string
  bg: string
  icon: string
  label: string
}

function StatTile({ color, bg, icon, label }: StatTileProps) {
  return (
    <div style={{ background: bg, borderRadius: 8, padding: '8px 6px', textAlign: 'center' }}>
      <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 8.5, fontWeight: 700, color, letterSpacing: '.03em' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>0</div>
    </div>
  )
}

/** Prévia inspirada na tela real de "Atendimento" do Vtcall (filas, abandonos, atendidas). */
export function VtcallPlaceholder() {
  return (
    <div style={{ padding: 12, fontSize: 11 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
        <StatTile color="#94640A" bg="#FAEEDA" icon="😐" label="NA FILA" />
        <StatTile color="#A32D2D" bg="#FCEBEB" icon="🙁" label="ABANDONOS" />
        <StatTile color="#27500A" bg="#EAF3DE" icon="🙂" label="ATENDIDAS" />
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--texto-sec)', marginBottom: 6, letterSpacing: '.03em' }}>
        AGUARDANDO ATENDIMENTO
      </div>
      <div style={{ border: '1px solid var(--borda)', borderRadius: 8, overflow: 'hidden' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            fontSize: 9.5,
            fontWeight: 700,
            padding: '6px 8px',
            background: 'var(--fundo)',
            color: 'var(--texto-sec)',
          }}
        >
          <span>Número</span>
          <span>Fila</span>
          <span>Tempo</span>
        </div>
        <div style={{ padding: '18px 8px', textAlign: 'center', fontSize: 10.5, color: 'var(--muted)' }}>
          Nenhuma ligação na fila
        </div>
      </div>
      <div style={{ marginTop: 12, textAlign: 'center', color: 'var(--texto-sec)' }}>
        Clique em <b>Entrar em Operação → Vtcall</b> para conectar seu ramal.
      </div>
    </div>
  )
}

/** Prévia inspirada na fila de conversas do MKTZAP (WhatsApp), no estado sem atendimentos. */
export function MktzapPlaceholder() {
  return (
    <div style={{ padding: 12, fontSize: 11 }}>
      <div style={{ fontSize: 10, color: 'var(--texto-sec)', marginBottom: 8 }}>Exibindo 0 de 0. Total 0.</div>
      <div
        style={{
          border: '1px solid var(--borda)',
          borderRadius: 8,
          padding: '26px 12px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontSize: 11,
        }}
      >
        Nenhuma conversa em andamento.
      </div>
      <div style={{ marginTop: 12, textAlign: 'center', color: 'var(--texto-sec)' }}>
        Clique em <b>Entrar em Operação → MKTZAP</b> para conectar seu WhatsApp.
      </div>
    </div>
  )
}
