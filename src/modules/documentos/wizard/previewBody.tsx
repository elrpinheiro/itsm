import type { Brand, ChecklistItem, DocumentFormData, EquipmentItem, TemplateId } from '@/types'
import { MANUT_EQUIPAMENTOS } from './templateForms/manutEquipamentos'
import { FORMATACAO_PROCESSOS } from './templateForms/formatacaoProcessos'
import { MOBILIZACAO_CONFIGURACAO } from './templateForms/mobilizacaoChecklist'
import { GMUD_ETAPAS } from './templateForms/gmudEtapas'
import { AVALIACAO_META, AVALIACAO_ORDER } from './templateForms/avaliacaoOptions'
import { VISIBILIDADE_LEGEND } from './templateForms/mudancaVisibilidade'

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

function equipamentoRows(equipamentos: EquipmentItem[]) {
  return equipamentos.filter((eq) => eq.descricao.trim() || eq.patrimonio.trim())
}

export function renderPreviewBody(
  templateId: TemplateId,
  data: DocumentFormData,
  multiData: Record<string, string[]>,
  brand: Brand,
  checklist: ChecklistItem[],
  equipamentos: EquipmentItem[],
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
              {equipamentoRows(equipamentos).map((eq, i) => (
                <tr key={i}>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{String(i + 2).padStart(2, '0')}</td>
                  <td style={cellStyle}>
                    {eq.descricao}
                    {eq.patrimonio ? ` · Patrimônio: ${eq.patrimonio}` : ''}
                  </td>
                </tr>
              ))}
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
            <thead>
              <tr>
                <th style={{ ...cellStyle, textAlign: 'left', background: '#F5F4EF' }}>Especificação do edital</th>
                <th style={{ ...cellStyle, textAlign: 'left', background: '#F5F4EF' }}>Especificações do ITEM (Referência)</th>
                <th style={{ ...cellStyle, textAlign: 'center', background: '#F5F4EF', width: 90 }}>Avaliação</th>
              </tr>
            </thead>
            <tbody>
              {checklist
                .filter((row) => row.descricao.trim() || (row.referencia ?? '').trim())
                .map((row, i) => (
                  <tr key={i}>
                    <td style={cellStyle}>{row.descricao}</td>
                    <td style={cellStyle}>{row.referencia ?? ''}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      {row.avaliacao ? (
                        <span style={{ color: AVALIACAO_META[row.avaliacao].color }} title={AVALIACAO_META[row.avaliacao].label}>
                          {AVALIACAO_META[row.avaliacao].icon}
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <div className="doc-sec">Observação</div>
          <div className="doc-txt">{data.obs || ''}</div>
          <div className="doc-sec">Resumo da avaliação</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 10.5 }}>
            {AVALIACAO_ORDER.map((kind) => {
              const meta = AVALIACAO_META[kind]
              const count = checklist.filter((row) => row.avaliacao === kind).length
              return (
                <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ color: meta.color, fontSize: 13 }}>{meta.icon}</span>
                  <span>
                    {meta.label}: <b>{count}</b>
                  </span>
                </div>
              )
            })}
          </div>
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
    case 'devolucao':
      return (
        <>
          <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>
            (1ª via – {brand.nome} · 2ª via – Funcionário)
          </div>
          <div style={{ marginBottom: 6 }}>
            Declaro para todos os fins de direito que realizei a devolução do equipamento/dispositivo descrito no
            item abaixo, em perfeito estado de funcionamento.
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
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
              {equipamentoRows(equipamentos).map((eq, i) => (
                <tr key={i}>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{String(i + 2).padStart(2, '0')}</td>
                  <td style={cellStyle}>
                    {eq.descricao}
                    {eq.patrimonio ? ` · Patrimônio: ${eq.patrimonio}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )
    case 'usb':
      return (
        <>
          <div style={{ fontSize: 9, color: '#888', marginBottom: 6 }}>
            (1ª via – {brand.nome} · 2ª via – Funcionário)
          </div>
          <p style={{ marginBottom: 6 }}>
            Declaro, para os devidos fins, que solicitei a liberação de uso da porta USB do equipamento abaixo
            identificado. Estou ciente de que o uso de mídias removíveis é <b>exceção</b>, permitido somente por
            necessidade operacional justificada.
          </p>
          <Kv label="Usuário" value={data.usuario} />
          <Kv label="Dispositivo" value={data.dispositivo} />
          <Kv label="Nome do computador" value={data.nomeComputador} />
          <Kv label="Patrimônio" value={data.patrimonio} />
          <div className="doc-kv">
            <b>Validade:</b>
            <span>90 dias após a assinatura deste</span>
          </div>
          <Kv label="Motivo da utilização" value={data.motivo} />
          <p style={{ margin: '6px 0' }}>
            Declaro estar ciente de que portas USB representam risco elevado à segurança da informação, podendo
            permitir fuga de dados, instalação de softwares não autorizados e entrada de vírus ou malwares. O uso
            indevido pode comprometer dados pessoais e corporativos, violando inclusive a{' '}
            <b>LGPD (Lei 13.709/2018)</b>.
          </p>
          <div className="doc-sec">Comprometo-me a</div>
          <ul style={{ margin: '0 0 6px 14px', padding: 0 }}>
            <li>Utilizar exclusivamente dispositivos autorizados pela empresa.</li>
            <li>Evitar uso de modems 3G, HDs externos ou mídias não reconhecidas pela TI.</li>
            <li>Garantir que dispositivos conectados estejam livres de vírus e riscos.</li>
            <li>Nunca utilizar mídias removíveis como armazenamento preferencial para dados corporativos.</li>
            <li>Proteger dados pessoais e corporativos, respeitando as normas de segurança e a LGPD.</li>
            <li>Informar imediatamente qualquer incidente, suspeita de vírus ou comportamento anormal.</li>
          </ul>
          <div className="doc-sec">Estou ciente de que</div>
          <ul style={{ margin: '0 0 6px 14px', padding: 0 }}>
            <li>A liberação de USB depende de autorização da supervisão e equipe de TI.</li>
            <li>A empresa pode realizar auditorias, bloqueios e monitoramento de uso para garantir conformidade.</li>
          </ul>
          <p>Declaro que li, compreendi e concordo integralmente com as condições acima.</p>
        </>
      )
    case 'formatacao': {
      return (
        <>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <Kv label="Número da OS" value={data.numeroOS} />
            </div>
            <div style={{ flex: 1 }}>
              <Kv label="Patrimônio" value={data.patrimonio} />
            </div>
            <div style={{ flex: 1 }}>
              <Kv label="Data" value={data.data} />
            </div>
          </div>
          <div className="doc-sec">Softwares necessários</div>
          <div className="doc-txt">{(multiData.softwares ?? []).join(', ') || '—'}</div>
          {data.outrosSoftwares && <Kv label="Outros softwares" value={data.outrosSoftwares} />}
          <div className="doc-sec">Processo de formatação</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5, marginBottom: 4 }}>
            <thead>
              <tr>
                <th style={{ ...cellStyle, background: '#F1EFE8', textAlign: 'left' }}>Processo</th>
                <th style={{ ...cellStyle, background: '#F1EFE8', width: 42 }}>Realizado?</th>
                <th style={{ ...cellStyle, background: '#F1EFE8', textAlign: 'left' }}>Observação</th>
              </tr>
            </thead>
            <tbody>
              {FORMATACAO_PROCESSOS.map((p) => (
                <tr key={p.key}>
                  <td style={cellStyle}>
                    <b>{p.processo}</b>
                    <br />
                    <span style={{ color: '#6b6a64' }}>{p.detalhamento}</span>
                  </td>
                  <td style={{ ...cellStyle, textAlign: 'center' }}>{data[`proc_${p.key}_realizado`] || '—'}</td>
                  <td style={cellStyle}>{data[`proc_${p.key}_obs`] || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="doc-sec">Observações</div>
          <div className="doc-txt">{data.obs || ''}</div>
        </>
      )
    }
    case 'mobilizacao': {
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Projeto" value={data.projeto} />
          <Kv label="Data" value={data.data} />
          <Kv label="Setor" value={data.setor} />
          <Kv label="Unidade escolar" value={data.unidadeEscolar} />
          <div className="doc-sec">Configuração de equipamentos</div>
          {MOBILIZACAO_CONFIGURACAO.map((grupo) => {
            const marcados = multiData[`config_${grupo.key}`] ?? []
            return (
              <div className="doc-kv" key={grupo.key}>
                <b>{grupo.label}:</b>
                <span>{marcados.join(', ') || '—'}</span>
              </div>
            )
          })}
          <div className="doc-sec">Instalação física de equipamentos</div>
          <div className="doc-txt">{(multiData.instalacaoFisica ?? []).join(', ') || '—'}</div>
          <div className="doc-sec">Observações</div>
          <div className="doc-txt">{data.obs || ''}</div>
        </>
      )
    }
    case 'gmud':
      return (
        <>
          <div className="doc-sec">Identificação</div>
          <Kv label="Título da mudança" value={data.titulo} />
          <Kv label="Data/Hora" value={data.dataHora} />
          <Kv label="Nº do chamado (TIC)" value={data.ticNumero} />
          <Kv label="Responsável pela execução" value={data.responsavel} />
          <Kv label="Visibilidade" value={data.visibilidade} />
          <div className="doc-sec">Progresso</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
            {GMUD_ETAPAS.map((etapa) => (
              <span className="ev-mini" key={etapa.key} style={{ color: '#0C447C', background: 'var(--azul-pale)' }}>
                {etapa.label}: {data[`etapa_${etapa.key}`] || '—'}
              </span>
            ))}
          </div>
          <div className="doc-sec">Escopo</div>
          <div className="doc-txt">{data.escopo || ''}</div>
          <div className="doc-sec">Informações adicionais</div>
          <div className="doc-txt">{data.infoAdicionais || ''}</div>
          <div className="doc-sec">Legenda — Tipos de Mudança</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9.5, marginBottom: 4 }}>
            <tbody>
              {VISIBILIDADE_LEGEND.map((item) => (
                <tr key={item.label}>
                  <td style={{ ...cellStyle, fontWeight: 700, width: 150, verticalAlign: 'top' }}>{item.label}</td>
                  <td style={{ ...cellStyle, verticalAlign: 'top', lineHeight: 1.5 }}>
                    <div>
                      <b>Características:</b> {item.caracteristicas}
                    </div>
                    <div>
                      <b>Aprovação:</b> {item.aprovacao}
                    </div>
                    <div>
                      <b>Exemplo:</b> {item.exemplo}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )
    default:
      return null
  }
}
