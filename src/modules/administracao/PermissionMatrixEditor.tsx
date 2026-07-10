import { MODULE_KEYS, MODULE_LABELS, type ModuleKey, type ModulePermission, type Perfil, type PermissionMatrix, type VisibilidadeAcesso } from '@/data/administracaoMock'

interface Props {
  perfil: Perfil
  onChange: (matriz: PermissionMatrix) => void
  /** Direito do usuário logado de editar a matriz (independente do perfil ser de fábrica). */
  canEdit: boolean
}

const VER_LABELS: Record<VisibilidadeAcesso, string> = {
  nenhum: 'Nenhum',
  proprios: 'Só os próprios',
  todos: 'Todos',
}

/** Só o módulo de chamados tem hoje o conceito de "registro do próprio usuário" implementado. */
const SUPORTA_PROPRIOS: Partial<Record<ModuleKey, boolean>> = { assistencia: true }

/** Matriz de permissões por módulo de um perfil — mesma ideia da matriz de direitos do GLPI
 * (cada perfil x módulo tem visibilidade + criar + editar), editável linha a linha. */
export default function PermissionMatrixEditor({ perfil, onChange, canEdit }: Props) {
  const readOnly = !!perfil.builtIn || !canEdit

  function updateModule(key: ModuleKey, patch: Partial<ModulePermission>) {
    if (readOnly) return
    onChange({ ...perfil.permissoes, [key]: { ...perfil.permissoes[key], ...patch } })
  }

  return (
    <div className="perm-matrix">
      {readOnly && (
        <div className="perm-matrix-locked">
          🔒 {perfil.builtIn ? 'Perfil de fábrica — a matriz não pode ser alterada.' : 'Você não tem permissão para editar esta matriz.'}
        </div>
      )}
      <div className="table-scroll">
        <table className="data-table perm-table">
          <thead>
            <tr>
              <th>Módulo</th>
              <th style={{ width: 150 }}>Ver</th>
              <th style={{ width: 90 }}>Criar</th>
              <th style={{ width: 90 }}>Editar</th>
            </tr>
          </thead>
          <tbody>
            {MODULE_KEYS.map((key) => {
              const perm = perfil.permissoes[key]
              const opcoesVer: VisibilidadeAcesso[] = SUPORTA_PROPRIOS[key] ? ['nenhum', 'proprios', 'todos'] : ['nenhum', 'todos']
              return (
                <tr key={key}>
                  <td>{MODULE_LABELS[key]}</td>
                  <td>
                    <select
                      value={perm.ver}
                      disabled={readOnly}
                      onChange={(e) => updateModule(key, { ver: e.target.value as VisibilidadeAcesso })}
                    >
                      {opcoesVer.map((v) => (
                        <option key={v} value={v}>
                          {VER_LABELS[v]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={perm.criar}
                      disabled={readOnly || perm.ver === 'nenhum'}
                      onChange={(e) => updateModule(key, { criar: e.target.checked })}
                    />
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={perm.editar}
                      disabled={readOnly || perm.ver === 'nenhum'}
                      onChange={(e) => updateModule(key, { editar: e.target.checked })}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
