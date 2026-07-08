import type { Brand, ChecklistItem, DocumentFormData, TemplateId } from '@/types'
import { MANUT_EQUIPAMENTOS } from './templateForms/manutEquipamentos'

function Kv({ label, value }: { label: string; value?: string }) {
  return (
    <div className="doc-kv">
      <b>{label}:</b>
      <span>{value ?? ''}</span>
    </div>
  )
}

function EquipamentoRow({ label, estado, motivo }: { label: string; estado?: string; motivo?: string[] }) {
  return (
    <div className="doc-kv">
      <b>{label}:</b>
      <span>
        {estado || '—'}
        {estado === 'Ruim' && motivo && motivo.length > 0 ? ` · Motivo: ${motivo.join(', ')}` : ''}
      </span>
    </div>
  )
}

const cellStyle = { border: '1px solid #E0DED6', padding: '3px 6px' }

export function renderPreviewBody(
  templateId: TemplateId,
  data: DocumentFormData,
  multiData: Record<string, string[]>,
  brand: Brand,
  checklist: ChecklistItem[],
) {
  switch (templateId) {
    case 'manut':
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Nome do projeto e local de visita" value={data.projeto} />
          <Kv label="Cidade/Estado" value={data.cidade} />
          <Kv label="Data e horário da visita" value={data.datahora} />
          <Kv label="Objetivo da visita" value={data.objetivo} />
          <div className="doc-sec">Checklist — Recursos de Infraestrutura</div>
          {MANUT_EQUIPAMENTOS.filter((eq) => eq.coluna === 'infra').map((eq) => (
            <EquipamentoRow
              key={eq.key}
              label={eq.label}
              estado={data[`${eq.key}_estado`]}
              motivo={multiData[`${eq.key}_motivo`]}
            />
          ))}
          <div className="doc-sec">Checklist — Recursos Operacionais</div>
          {MANUT_EQUIPAMENTOS.filter((eq) => eq.coluna === 'oper').map((eq) => (
            <EquipamentoRow
              key={eq.key}
              label={eq.label}
              estado={data[`${eq.key}_estado`]}
              motivo={multiData[`${eq.key}_motivo`]}
            />
          ))}
          {data.outros && <Kv label="Outros — Especifique" value={data.outros} />}
          <div className="doc-sec">Soluções da visita</div>
          <div className="doc-txt">{data.solucoes || ''}</div>
        </>
      )
    case 'checklist': {
      const conexao = multiData.conexaoInternet ?? []
      const seguranca = multiData.seguranca ?? []
      const paredes = multiData.condicoesParede ?? []
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Projeto" value={data.projeto} />
          <Kv label="Data/hora" value={data.datahora} />
          <Kv label="E-mail/telefone" value={data.contato} />
          <Kv label="Unidade escolar" value={data.unidade} />
          <Kv label="Endereço" value={data.endereco} />

          <div className="doc-sec">Estrutura local</div>
          <Kv label="Tensão elétrica" value={data.tensao} />
          <Kv label="Tipo de tomadas" value={data.tomadas} />
          <Kv label="Conexão de internet existente" value={conexao.join(', ') || undefined} />
          <Kv label="Segurança" value={seguranca.join(', ') || undefined} />
          <Kv label="Forro" value={data.forro} />
          <Kv label="Piso" value={data.piso} />
          <Kv label="Condições da parede" value={paredes.join(', ') || undefined} />
          <Kv label="Iluminação" value={data.iluminacao} />
          <Kv label="Ventilação" value={data.ventilacao} />
          <Kv label="Ruído" value={data.ruido} />
          <Kv label="Possui colunas" value={data.colunas} />

          <div className="doc-sec">Considerações para projeto</div>
          <Kv label="Área livre disponível para instalação dos equipamentos de TI" value={data.areaLivre} />
          <Kv label="Necessidade de nobreaks para os equipamentos de TI" value={data.nobreaks} />
          <Kv label="Estrutura para instalação de link de internet" value={data.estruturaLink} />
          <Kv label="Quantidade de tomadas na sala" value={data.tomadasQtd} />
          <Kv label="Localização das tomadas" value={data.tomadasLocal} />
          <Kv label="Acesso ao público nos finais de semana e feriado" value={data.acessoPublico} />
          <Kv label="Já houve incidentes de roubo/furto no local" value={data.incidenteRoubo} />
          <Kv label="Altura (teto ao chão)" value={data.alturaSala} />
          <Kv label="Largura" value={data.larguraSala} />
          <Kv label="Comprimento" value={data.comprimentoSala} />

          <div className="doc-sec">Observações</div>
          <div className="doc-txt">{data.obs || ''}</div>
        </>
      )
    }
    case 'termo':
      return (
        <>
          <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>
            (1ª via – {brand.nome} · 2ª via – Funcionário)
          </div>
          <div style={{ marginBottom: 6 }}>
            Declaro, para os devidos fins, que recebi da <b>{brand.razaoSocial}</b> os equipamentos abaixo
            relacionados, em perfeito estado de uso, e que seu propósito é exclusivamente profissional.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 8 }}>
            <thead>
              <tr>
                <th style={{ ...cellStyle, background: '#F1EFE8', width: 22 }}>Item</th>
                <th style={{ ...cellStyle, background: '#F1EFE8', textAlign: 'left' }}>Descrição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ ...cellStyle, textAlign: 'center' }}>01</td>
                <td style={cellStyle}>
                  <b>Usuário:</b> {data.usuario || ''}
                </td>
              </tr>
              <tr>
                <td style={{ ...cellStyle, textAlign: 'center' }}>02</td>
                <td style={cellStyle}>
                  <b>Dispositivo:</b> {data.dispositivo || ''}
                  <br />
                  <b>Patrimônio:</b> {data.patrimonio || ''}
                </td>
              </tr>
              <tr>
                <td style={{ ...cellStyle, textAlign: 'center' }}>03</td>
                <td style={cellStyle}>
                  <b>Item:</b> {data.itens || ''}
                </td>
              </tr>
            </tbody>
          </table>
          <p style={{ marginBottom: 6 }}>
            Declaro ser responsável pela guarda, conservação e uso adequado do equipamento. Comprometo-me a
            utilizá-lo somente para atividades de trabalho, seguindo as políticas internas e normas de segurança da
            informação.
          </p>
          <p style={{ marginBottom: 6 }}>
            Comprometo-me também a não instalar softwares não autorizados, não compartilhar o equipamento com
            terceiros, não armazenar dados pessoais ou corporativos fora dos ambientes aprovados pela empresa, e a
            respeitar integralmente a LGPD – Lei 13.709/2018, utilizando qualquer dado pessoal acessado apenas para
            a finalidade do meu trabalho e mantendo sigilo absoluto.
          </p>
          <p style={{ marginBottom: 6 }}>
            Reconheço que o equipamento pode conter sistemas de proteção, criptografia e monitoramento
            corporativo. Manterei o dispositivo protegido por senha e não o deixarei desacompanhado em locais
            públicos.
          </p>
          <p style={{ marginBottom: 6 }}>
            Em caso de perda, dano, furto ou extravio, comprometo-me a comunicar imediatamente ao gestor e ao setor
            de TI, bem como seguir os procedimentos internos. Estou ciente de que posso ser responsabilizado em
            casos de negligência comprovada.
          </p>
          <p style={{ marginBottom: 6 }}>
            Comprometo-me a devolver todos os equipamentos e acessórios em bom estado sempre que solicitado ou no
            desligamento, autorizando a empresa a realizar limpeza e formatação dos dados corporativos.
          </p>
          <p>Declaro ter lido e compreendido este termo, concordando integralmente com suas condições.</p>
        </>
      )
    case 'homolog': {
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
          <div className="doc-sec">Checklist de especificações</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, marginBottom: 4 }}>
            <tbody>
              {checklist.map((row, i) => (
                <tr key={i}>
                  <td style={{ ...cellStyle, width: 20, textAlign: 'center', color: 'var(--verde)' }}>✔</td>
                  <td style={cellStyle}>{row.descricao}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="doc-sec">Observação</div>
          <div className="doc-txt">{data.obs || ''}</div>
        </>
      )
    }
    case 'recibo':
      return (
        <>
          <Kv label="Data" value={data.data} />
          <Kv label="Departamento" value={data.departamento} />
          <div className="doc-sec">Recibo de Entrega</div>
          <Kv label="Entregue por" value={data.entregue} />
          <Kv label="Recebido por" value={data.recebido} />
          <div className="doc-sec">Relação de materiais/equipamentos entregues</div>
          <div className="doc-txt">{data.materiais || ''}</div>
          <div style={{ margin: '6px 0' }}>
            ({data.confirma === 'Confirmo recebimento' ? 'X' : '  '}) Confirmo recebimento &nbsp;&nbsp; (
            {data.confirma === 'Recuso recebimento' ? 'X' : '  '}) Recuso recebimento
          </div>
          {data.confirma === 'Recuso recebimento' && <Kv label="Motivo da recusa" value={data.motivo} />}
        </>
      )
    default:
      return null
  }
}
