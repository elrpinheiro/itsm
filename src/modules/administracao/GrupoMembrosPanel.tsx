import { useState } from 'react'
import type { Grupo } from '@/data/administracaoMock'
import { useAdminStore } from '@/store/useAdminStore'

interface Props {
  grupo: Grupo
  canEdit: boolean
}

/** Membros de um grupo — no GLPI real, a aba "Users" do grupo lista quem pertence a ele (relação
 * N:N: um usuário pode estar em vários grupos). Simplificado aqui: só entra/sai do grupo, sem as
 * flags de "gerente"/"delegado" que o GLPI guarda por vínculo usuário-grupo. */
export default function GrupoMembrosPanel({ grupo, canEdit }: Props) {
  const usuarios = useAdminStore((s) => s.usuarios)
  const addUsuarioToGrupo = useAdminStore((s) => s.addUsuarioToGrupo)
  const removeUsuarioFromGrupo = useAdminStore((s) => s.removeUsuarioFromGrupo)
  const [novoMembroId, setNovoMembroId] = useState('')

  const membros = usuarios.filter((u) => u.grupoIds?.includes(grupo.id))
  const disponiveis = usuarios.filter((u) => !u.grupoIds?.includes(grupo.id))

  function handleAdicionar() {
    if (!novoMembroId) return
    addUsuarioToGrupo(novoMembroId, grupo.id)
    setNovoMembroId('')
  }

  return (
    <div className="perm-matrix">
      <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Membros do grupo — {grupo.nome}</div>
      {!canEdit && (
        <div className="perm-matrix-locked">🔒 Você não tem permissão para alterar os membros deste grupo.</div>
      )}
      <div className="table-scroll">
        <table className="data-table perm-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Login</th>
              <th>E-mail</th>
              {canEdit && <th style={{ width: 100 }}>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {membros.length === 0 && (
              <tr>
                <td colSpan={canEdit ? 4 : 3} style={{ textAlign: 'center', color: 'var(--texto-sec)' }}>
                  Nenhum membro neste grupo.
                </td>
              </tr>
            )}
            {membros.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.login}</td>
                <td>{u.email}</td>
                {canEdit && (
                  <td>
                    <button
                      className="btn"
                      style={{ fontSize: 11, padding: '4px 8px', color: 'var(--vermelho-texto)' }}
                      onClick={() => removeUsuarioFromGrupo(u.id, grupo.id)}
                    >
                      Remover
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {canEdit && (
        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
          <select value={novoMembroId} onChange={(e) => setNovoMembroId(e.target.value)} style={{ maxWidth: 280 }}>
            <option value="">Selecione um usuário…</option>
            {disponiveis.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome} ({u.login})
              </option>
            ))}
          </select>
          <button className="btn btn-primary" style={{ fontSize: 12.5, padding: '7px 14px' }} disabled={!novoMembroId} onClick={handleAdicionar}>
            + Adicionar membro
          </button>
        </div>
      )}
    </div>
  )
}
