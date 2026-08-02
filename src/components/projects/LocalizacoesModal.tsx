import { useState } from 'react'
import Modal from '@/components/common/Modal'
import { useCatalogStore, useLocalizacoesDoProjeto } from '@/store/useCatalogStore'
import type { Project } from '@/types'

interface Props {
  project: Project
  onClose: () => void
}

/** Gerencia a lista real de localizações de um projeto — enquanto nenhuma for cadastrada, o campo
 * Localização de Novo Atendimento cai na lista de teste (Teste 1/2/3), igual para todos os projetos. */
export default function LocalizacoesModal({ project, onClose }: Props) {
  const efetivas = useLocalizacoesDoProjeto(project.id)
  const customDefinida = useCatalogStore((s) => Boolean(s.customLocalizacoes[project.id]?.length))
  const setLocalizacoes = useCatalogStore((s) => s.setLocalizacoes)
  const [lista, setLista] = useState<string[]>(customDefinida ? efetivas : [])
  const [novo, setNovo] = useState('')

  function commit(next: string[]) {
    setLista(next)
    setLocalizacoes(project.id, next)
  }

  function handleAdicionar() {
    const nome = novo.trim()
    if (!nome) return
    if (lista.includes(nome)) {
      setNovo('')
      return
    }
    commit([...lista, nome])
    setNovo('')
  }

  function handleRemover(nome: string) {
    commit(lista.filter((l) => l !== nome))
  }

  return (
    <Modal title={`Localizações — ${project.nome}`} onClose={onClose}>
      <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 12, maxWidth: 380 }}>
        {customDefinida
          ? 'Estas são as localizações reais desta unidade, usadas no campo Localização de Novo Atendimento.'
          : 'Esta unidade ainda não tem localizações reais cadastradas — o campo Localização de Novo Atendimento está usando a lista de teste (Localização Teste 1/2/3). Cadastre abaixo para substituí-la.'}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12, maxHeight: 240, overflowY: 'auto' }}>
        {lista.map((nome) => (
          <div key={nome} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--fundo)', padding: '6px 10px', borderRadius: 8 }}>
            <span style={{ flex: 1, fontSize: 12.5 }}>{nome}</span>
            <button type="button" className="btn" style={{ fontSize: 11, padding: '3px 8px', color: 'var(--vermelho-texto)' }} onClick={() => handleRemover(nome)}>
              Remover
            </button>
          </div>
        ))}
        {lista.length === 0 && <div style={{ fontSize: 12, color: 'var(--texto-sec)' }}>Nenhuma localização cadastrada ainda.</div>}
      </div>
      <div className="frow" style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label className="field-label">Nova localização</label>
          <input
            type="text"
            value={novo}
            onChange={(e) => setNovo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleAdicionar()
              }
            }}
            placeholder="Ex.: Sala de Informática"
          />
        </div>
        <button type="button" className="btn btn-primary" style={{ padding: '9px 14px' }} onClick={handleAdicionar}>
          + Adicionar
        </button>
      </div>
      <div className="admin-form-actions">
        <button type="button" className="btn btn-primary" onClick={onClose}>
          Concluído
        </button>
      </div>
    </Modal>
  )
}
