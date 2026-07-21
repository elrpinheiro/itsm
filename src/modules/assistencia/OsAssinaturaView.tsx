import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useAdminStore } from '@/store/useAdminStore'
import { useChamadosStore } from '@/store/useChamadosStore'
import { useDropdownEntries } from '@/store/useDropdownsStore'
import { useAllBrandsMap, useAllProjects } from '@/store/useCatalogStore'
import { getTemplateById } from '@/data/templates'
import { WizardContext, type WizardContextValue } from '@/modules/documentos/wizard/WizardContext'
import DocumentPreview from '@/modules/documentos/wizard/DocumentPreview'
import Step3Sign from '@/modules/documentos/wizard/Step3Sign'
import Step4Seal from '@/modules/documentos/wizard/Step4Seal'
import type { DocumentFormData, Signer } from '@/types'

interface Props {
  numero: string
  onClose: () => void
}

const OS_TEMPLATE = getTemplateById('os')!

function buildSigners(tecnicoNome: string, requerenteNome: string): Signer[] {
  return [
    { id: 1, nome: tecnicoNome, cargo: 'Técnico responsável', cpf: '', email: '', x: 18, y: 330, signed: false },
    { id: 2, nome: requerenteNome, cargo: 'Requerente', cpf: '', email: '', x: 203, y: 330, signed: false },
  ]
}

/**
 * Gera a Ordem de Serviço a partir dos dados já registrados no chamado (descrição, acompanhamentos
 * públicos e solução) e leva direto para a assinatura — sem formulário manual, sem posicionamento:
 * as posições dos dois signatários (técnico + requerente) já vêm no padrão do modelo de OS. Reaproveita
 * Step3Sign/Step4Seal do wizard de documentos (mesmo hash/manifesto de evidências e PDF/A selado); ao
 * selar, fecha o chamado de fato via confirmarAssinatura.
 */
export default function OsAssinaturaView({ numero, onClose }: Props) {
  const user = useAuthStore((s) => s.user)
  const usuarios = useAdminStore((s) => s.usuarios)
  const chamado = useChamadosStore((s) => s.chamados.find((c) => c.numero === numero))
  const confirmarAssinatura = useChamadosStore((s) => s.confirmarAssinatura)
  const origemLabels = Object.fromEntries(useDropdownEntries('origem').map((e) => [e.chave, e.label]))
  const projetos = useAllProjects()
  const brandsMap = useAllBrandsMap()

  const [fase, setFase] = useState<'revisao' | 3 | 4>('revisao')
  const autor = user?.nome ?? 'Atendente'

  const project = chamado ? projetos.find((p) => `${p.nome} — ${p.cidade}` === chamado.projetoNome) : undefined
  const brand = project ? brandsMap[project.brandId] : undefined
  const requerenteNome = chamado?.solicitanteEmail
    ? usuarios.find((u) => u.email === chamado.solicitanteEmail)?.nome ?? chamado.solicitanteEmail
    : ''

  const [signers, setSigners] = useState<Signer[]>(() => buildSigners(chamado?.atribuidoA ?? autor, requerenteNome))
  const [currentSignerIndex, setCurrentSignerIndex] = useState(0)

  const formData: DocumentFormData = useMemo(() => {
    if (!chamado) return {} as DocumentFormData
    const publicas = (chamado.interacoes ?? []).filter((it) => it.publico)
    const timeline = publicas
      .map((it) => `${it.autor} (${it.origem === 'Sistema' ? 'Sistema' : origemLabels[it.origem] ?? it.origem}, ${it.criadoEm}): ${it.texto}`)
      .join('\n\n')
    const ultimaSolucao = [...publicas].reverse().find((it) => it.tipo === 'solucao')?.texto ?? chamado.acaoRealizada ?? ''
    return {
      numero: chamado.numero,
      unidade: chamado.projetoNome,
      requerente: requerenteNome,
      requerenteEmail: chamado.solicitanteEmail ?? '',
      titulo: chamado.assunto,
      responsavel: chamado.atribuidoA ?? autor,
      origem: chamado.origem ? origemLabels[chamado.origem] ?? chamado.origem : '',
      categoria: chamado.categoria ?? '',
      abertoHa: chamado.abertoHa,
      emissao: new Date().toLocaleDateString('pt-BR'),
      descricao: chamado.descricao ?? '',
      timeline,
      solucao: ultimaSolucao,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chamado, requerenteNome, origemLabels])

  if (!chamado) {
    return (
      <div className="mod-scroll-area">
        <button type="button" className="btn" onClick={onClose}>← Voltar</button>
        <div style={{ marginTop: 14 }}>Chamado não encontrado.</div>
      </div>
    )
  }

  if (!project || !brand) {
    return (
      <div className="mod-scroll-area">
        <button type="button" className="btn" onClick={onClose}>← Voltar</button>
        <div style={{ marginTop: 14 }}>
          Não foi possível identificar a marca/projeto deste chamado ("{chamado.projetoNome}") para montar o
          cabeçalho da OS.
        </div>
      </div>
    )
  }

  const ctx: WizardContextValue = {
    template: OS_TEMPLATE,
    brand,
    step: fase === 'revisao' ? 1 : fase,
    setStep: () => {},
    formData,
    updateField: () => {},
    multiData: {},
    updateMultiField: () => {},
    checklist: [],
    setChecklist: () => {},
    equipamentos: [],
    setEquipamentos: () => {},
    signers,
    setSigners,
    currentSignerIndex,
    setCurrentSignerIndex,
  }

  function handleSelado() {
    confirmarAssinatura(numero)
    onClose()
  }

  return (
    <WizardContext.Provider value={ctx}>
      <div className="mod-scroll-area">
        <div className="chd-breadcrumb">
          Assistência <span>›</span> Fila de chamados <span>›</span> {chamado.numero} <span>›</span> Ordem de Serviço
        </div>

        {fase === 'revisao' && (
          <>
            <div className="mod-section-title" style={{ marginBottom: 10 }}>
              OS gerada a partir do chamado {chamado.numero}
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--texto-sec)', maxWidth: 640, marginBottom: 14 }}>
              A descrição, os acompanhamentos públicos e a solução do atendimento já foram trazidos para o
              documento abaixo — confira antes de coletar as duas assinaturas (técnico e requerente).
              Acompanhamentos marcados como privados não entram na OS.
            </p>
            <DocumentPreview style={{ minHeight: 400, maxWidth: 640 }} />
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button type="button" className="btn" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={() => setFase(3)}>
                ✍ Iniciar assinaturas
              </button>
            </div>
          </>
        )}

        {fase === 3 && <Step3Sign onFinish={() => setFase(4)} />}
        {fase === 4 && <Step4Seal onNovoDocumento={handleSelado} finishLabel="✓ Fechar chamado e voltar" />}
      </div>
    </WizardContext.Provider>
  )
}
