import type { Brand, ChecklistItem, DocumentFormData, TemplateId } from '@/types'

function Kv({ label, value }: { label: string; value?: string }) {
  return (
    <div className="doc-kv">
      <b>{label}:</b>
      <span>{value ?? ''}</span>
    </div>
  )
}

const cellStyle = { border: '1px solid #E0DED6', padding: '3px 6px' }

export function renderPreviewBody(
  templateId: TemplateId,
  data: DocumentFormData,
  brand: Brand,
  checklist: ChecklistItem[],
) {
  switch (templateId) {
    case 'manut':
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Nome do projeto e local" value={data.projeto} />
          <Kv label="Cidade/Estado" value={data.cidade} />
          <Kv label="Data e horário" value={data.datahora} />
          <Kv label="Objetivo" value={data.objetivo} />
          <div className="doc-sec">Checklist</div>
          <div className="doc-kv">
            <b>Unifi (infra):</b>
            <span>
              {data.unifi || '—'}
              {data.unifi === 'Ruim' && data.unifi_motivo ? ` · ${data.unifi_motivo}` : ''}
            </span>
          </div>
          <div className="doc-kv">
            <b>Gabinete de carga (oper.):</b>
            <span>
              {data.gabinete || '—'}
              {data.gabinete === 'Ruim' && data.gab_motivo ? ` · ${data.gab_motivo}` : ''}
            </span>
          </div>
          <div className="doc-sec">Soluções da visita</div>
          <div className="doc-txt">{data.solucoes || ''}</div>
        </>
      )
    case 'checklist':
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Projeto" value={data.projeto} />
          <Kv label="Data/hora" value={data.datahora} />
          <Kv label="E-mail/telefone" value={data.contato} />
          <Kv label="Unidade escolar" value={data.unidade} />
          <Kv label="Endereço" value={data.endereco} />
          <div className="doc-sec">Estrutura local</div>
          <div className="doc-kv">
            <b>Tensão elétrica:</b>
            <span>{data.tensao || '—'}</span>
          </div>
          <div className="doc-sec">Considerações para projeto</div>
          <div className="doc-txt">{data.infra || ''}</div>
          <div className="doc-sec">Observações</div>
          <div className="doc-txt">{data.obs || ''}</div>
        </>
      )
    case 'termo':
      return (
        <>
          <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>
            (1ª via – {brand.nome} · 2ª via – Funcionário)
          </div>
          <div style={{ marginBottom: 6 }}>
            Declaro, para os devidos fins, que recebi da <b>{brand.razaoSocial}</b> os equipamentos abaixo
            relacionados, em perfeito estado de conservação e funcionamento.
          </div>
          <div className="doc-sec">Equipamentos</div>
          <Kv label="Usuário" value={data.usuario} />
          <Kv label="Dispositivo" value={data.dispositivo} />
          <Kv label="Itens/acessórios" value={data.itens} />
          <div className="doc-sec">Cláusulas de responsabilidade</div>
          <div style={{ fontSize: 9, color: '#6b6a64', lineHeight: 1.5 }}>
            Guarda, conservação e uso adequado · uso exclusivamente profissional · proibição de softwares não
            autorizados e compartilhamento · sistemas de proteção e monitoramento corporativo · comunicação
            imediata de perda, dano ou furto com registro de B.O. · devolução no desligamento. Declaro ter lido e
            compreendido este termo, concordando integralmente.
          </div>
        </>
      )
    case 'homolog': {
      const rows = checklist
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Município/Projeto" value={data.municipio} />
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Kv label="Data" value={data.data} />
            </div>
            <div style={{ flex: 1 }}>
              <Kv label="Setor" value={data.setor} />
            </div>
          </div>
          <Kv label="Item analisado" value={data.item} />
          <div className="doc-sec">Checklist</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 4 }}>
            <thead>
              <tr>
                <th style={{ ...cellStyle, background: '#F1EFE8', width: 22 }}>#</th>
                <th style={{ ...cellStyle, background: '#F1EFE8', textAlign: 'left' }}>Descritivo</th>
                <th style={{ ...cellStyle, background: '#F1EFE8', width: 34 }}>St.</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td style={{ ...cellStyle, width: 22, textAlign: 'center' }}>{i + 1}</td>
                  <td style={cellStyle}>{r.descricao}</td>
                  <td style={{ ...cellStyle, width: 34, textAlign: 'center', fontSize: 12 }}>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 8.5, color: '#888' }}>
            ✔ conforme · ✖ não conforme · ⚠️ atenção · – não se aplica
          </div>
          <div className="doc-sec">Observação</div>
          <div className="doc-txt">{data.obs || ''}</div>
        </>
      )
    }
    case 'recibo':
      return (
        <>
          <div className="doc-sec">Recibo</div>
          <Kv label="Entregue por" value={data.entregue} />
          <Kv label="Recebido por" value={data.recebido} />
          <div className="doc-sec">Relação de materiais/equipamentos</div>
          <div className="doc-txt">{data.materiais || ''}</div>
          <div style={{ margin: '6px 0' }}>
            ({data.confirma === 'Confirmo recebimento' ? 'X' : '  '}) Confirmo recebimento &nbsp;&nbsp; (
            {data.confirma === 'Recuso recebimento' ? 'X' : '  '}) Recuso recebimento
          </div>
          {data.confirma === 'Recuso recebimento' && <Kv label="Motivo" value={data.motivo} />}
        </>
      )
    default:
      return null
  }
}
