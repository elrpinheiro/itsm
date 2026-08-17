import { useProjectStore } from '@/store/useProjectStore'
import { useAllProjects } from '@/store/useCatalogStore'
import { ARQUIVOS_BASE_CONHECIMENTO, type ArquivoBaseConhecimento } from '@/data/baseConhecimentoArquivos'
import { baixarArquivo } from '@/utils/download'

function ListaArquivos({ arquivos }: { arquivos: ArquivoBaseConhecimento[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {arquivos.map((arq) => (
        <div
          key={arq.nomeArquivo}
          className="card"
          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px' }}
        >
          <span style={{ fontSize: 20 }}>📄</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{arq.titulo}</div>
            <div style={{ fontSize: 11.5, color: 'var(--texto-sec)' }}>{arq.nomeArquivo}</div>
          </div>
          <button type="button" className="btn btn-primary" style={{ fontSize: 12, padding: '6px 12px' }} onClick={() => baixarArquivo(arq.arquivoUrl, arq.nomeArquivo)}>
            ↓ Baixar
          </button>
        </div>
      ))}
    </div>
  )
}

function Placeholder({ mensagem }: { mensagem: string }) {
  return (
    <div className="empty-box">
      <div style={{ fontSize: 40, marginBottom: 12 }}>📚</div>
      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Base de Conhecimento</div>
      <div style={{ fontSize: 13, color: 'var(--texto-sec)', lineHeight: 1.6 }}>{mensagem}</div>
      <span className="badge badge-amber" style={{ marginTop: 14 }}>
        Em breve
      </span>
    </div>
  )
}

/** Artigos escritos e busca ainda estão "Em construção" — o que já existe é o anexo de documentos de
 * referência por entidade (ver src/data/baseConhecimentoArquivos.ts), listados aqui: só os da entidade
 * ativa quando dentro de um projeto, ou agrupados por entidade na visão global. */
export default function BaseConhecimentoModule() {
  const project = useProjectStore((s) => s.selectedProject)
  const projetos = useAllProjects()

  if (project) {
    const arquivos = ARQUIVOS_BASE_CONHECIMENTO[project.id] ?? []
    if (arquivos.length === 0) {
      return <Placeholder mensagem={`Nenhum documento de referência cadastrado ainda para ${project.nome}. Em breve: artigos e procedimentos para consulta rápida da equipe.`} />
    }
    return (
      <div>
        <div className="mod-section-title">Documentos — {project.nome}</div>
        <ListaArquivos arquivos={arquivos} />
      </div>
    )
  }

  const entidadesComArquivos = projetos.filter((p) => (ARQUIVOS_BASE_CONHECIMENTO[p.id]?.length ?? 0) > 0)
  if (entidadesComArquivos.length === 0) {
    return <Placeholder mensagem="Em construção. Aqui entrarão artigos, procedimentos e soluções para consulta rápida da equipe." />
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {entidadesComArquivos.map((p) => (
        <div key={p.id}>
          <div className="mod-section-title">{p.nome} — {p.cidade}</div>
          <ListaArquivos arquivos={ARQUIVOS_BASE_CONHECIMENTO[p.id]} />
        </div>
      ))}
    </div>
  )
}
