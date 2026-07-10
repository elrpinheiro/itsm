import { useState } from 'react'
import SectionSidebarLayout, { type SectionSidebarItem } from '@/components/layout/SectionSidebarLayout'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useAdminStore } from '@/store/useAdminStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllProjects } from '@/store/useCatalogStore'
import PermissionMatrixEditor from './PermissionMatrixEditor'
import NovoUsuarioModal from './NovoUsuarioModal'
import NovoGrupoModal from './NovoGrupoModal'
import NovoFornecedorModal from './NovoFornecedorModal'
import NovoPerfilModal from './NovoPerfilModal'

type Section = 'perfis' | 'usuarios' | 'grupos' | 'fornecedores'
type OpenModal = 'usuario' | 'grupo' | 'fornecedor' | 'perfil' | null

const ITEMS: SectionSidebarItem[] = [
  { key: 'perfis', label: 'Perfis', icon: '🛡️' },
  { key: 'usuarios', label: 'Usuários', icon: '👤' },
  { key: 'grupos', label: 'Grupos', icon: '👥' },
  { key: 'fornecedores', label: 'Fornecedores', icon: '🏢' },
]

const PERFIS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'usuarios', label: 'Usuários', width: '90px' },
]

const USUARIOS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'login', label: 'Login', width: '120px' },
  { key: 'email', label: 'E-mail' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'entidade', label: 'Entidade', width: '150px' },
  { key: 'perfil', label: 'Perfil', width: '110px' },
  { key: 'status', label: 'Status', width: '80px' },
  { key: 'acoes', label: 'Ações', width: '160px' },
]

const GRUPOS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome do grupo' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'membros', label: 'Membros', width: '80px' },
  { key: 'solicitante', label: 'Solicitante', width: '90px' },
  { key: 'atribuicao', label: 'Atribuição', width: '90px' },
  { key: 'notificacao', label: 'Notificação', width: '90px' },
]

const FORNECEDORES_COLUMNS: DataTableColumn[] = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'tipo', label: 'Tipo', width: '150px' },
  { key: 'servico', label: 'Serviço' },
  { key: 'contato', label: 'Contato' },
  { key: 'local', label: 'Cidade/UF', width: '130px' },
]

function Flag({ on }: { on: boolean }) {
  return <span style={{ color: on ? 'var(--verde)' : 'var(--texto-sec)' }}>{on ? '✓' : '—'}</span>
}

export default function AdministracaoModule() {
  const currentProject = useProjectStore((s) => s.selectedProject)
  const [active, setActive] = useState<Section>('perfis')
  const [openModal, setOpenModal] = useState<OpenModal>(null)
  const [selectedPerfilId, setSelectedPerfilId] = useState<string | null>(null)
  const [entidadeFiltro, setEntidadeFiltro] = useState(currentProject?.id ?? '')

  const perfis = useAdminStore((s) => s.perfis)
  const usuarios = useAdminStore((s) => s.usuarios)
  const grupos = useAdminStore((s) => s.grupos)
  const fornecedores = useAdminStore((s) => s.fornecedores)
  const updatePermissao = useAdminStore((s) => s.updatePermissao)
  const removePerfil = useAdminStore((s) => s.removePerfil)
  const toggleUsuarioStatus = useAdminStore((s) => s.toggleUsuarioStatus)
  const removeUsuario = useAdminStore((s) => s.removeUsuario)
  const acessoAdmin = useModuleAccess('administracao')
  const currentUser = useAuthStore((s) => s.user)
  const projetos = useAllProjects()
  const projetoMap = Object.fromEntries(projetos.map((p) => [p.id, `${p.nome} — ${p.cidade}`]))

  const perfilMap = Object.fromEntries(perfis.map((p) => [p.id, p.nome]))
  const selectedPerfil = perfis.find((p) => p.id === selectedPerfilId) ?? null

  const usuariosFiltrados = entidadeFiltro ? usuarios.filter((u) => u.projetoId === entidadeFiltro) : usuarios

  function handleExcluirPerfil() {
    if (!selectedPerfil) return
    if (!window.confirm(`Excluir o perfil "${selectedPerfil.nome}"? Esta ação não pode ser desfeita.`)) return
    const result = removePerfil(selectedPerfil.id)
    if (!result.ok) {
      alert(result.error)
      return
    }
    setSelectedPerfilId(null)
  }

  function handleExcluirUsuario(id: string, nome: string) {
    if (currentUser && usuarios.find((u) => u.id === id)?.email === currentUser.email) {
      alert('Você não pode excluir o próprio usuário logado.')
      return
    }
    if (!window.confirm(`Excluir o usuário "${nome}"? Esta ação não pode ser desfeita.`)) return
    removeUsuario(id)
  }

  return (
    <SectionSidebarLayout title="Administração" items={ITEMS} active={active} onSelect={(k) => setActive(k as Section)}>
      <div className="mod-scroll-area">
        {active === 'perfis' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Perfis de acesso
              </div>
              {acessoAdmin.editar && (
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
                  onClick={() => setOpenModal('perfil')}
                >
                  + Novo perfil
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 12, maxWidth: 620 }}>
              Os 8 perfis padrão de uma instalação GLPI (Super-Admin, Admin, Supervisor, Technician, Hotliner,
              Observer, Read-Only, Self-Service), adaptados aos módulos deste sistema. Clique num perfil para
              ver ou ajustar o que ele pode visualizar e editar em cada módulo.
            </div>
            <DataTable
              columns={PERFIS_COLUMNS}
              rows={perfis.map((p) => ({
                nome: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <b>{p.nome}</b>
                    {p.builtIn && <span className="badge badge-blue">Fábrica</span>}
                  </span>
                ),
                descricao: p.descricao,
                usuarios: usuarios.filter((u) => u.perfilId === p.id).length,
              }))}
              onRowClick={(i) => setSelectedPerfilId(perfis[i].id)}
              selectedIndex={selectedPerfilId ? perfis.findIndex((p) => p.id === selectedPerfilId) : undefined}
            />
            {selectedPerfil && (
              <>
                <PermissionMatrixEditor
                  perfil={selectedPerfil}
                  canEdit={acessoAdmin.editar}
                  onChange={(matriz) => updatePermissao(selectedPerfil.id, matriz)}
                />
                {acessoAdmin.editar && !selectedPerfil.builtIn && (
                  <button className="btn" style={{ fontSize: 12, marginTop: 10, color: '#a30000' }} onClick={handleExcluirPerfil}>
                    🗑 Excluir perfil
                  </button>
                )}
              </>
            )}
          </>
        )}

        {active === 'usuarios' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Usuários
              </div>
              <select
                value={entidadeFiltro}
                onChange={(e) => setEntidadeFiltro(e.target.value)}
                style={{ width: 'auto', fontSize: 12.5, padding: '6px 10px' }}
                title="Filtrar por entidade (projeto)"
              >
                <option value="">Todas as entidades</option>
                {projetos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nome} — {p.cidade}
                  </option>
                ))}
              </select>
              {acessoAdmin.editar && (
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
                  onClick={() => setOpenModal('usuario')}
                >
                  + Novo usuário
                </button>
              )}
            </div>
            <div className="table-scroll">
              <DataTable
                columns={USUARIOS_COLUMNS}
                emptyText="Nenhum usuário nesta entidade."
                rows={usuariosFiltrados.map((u) => ({
                  nome: <b>{u.nome}</b>,
                  login: u.login,
                  email: u.email,
                  cargo: u.cargo ?? '—',
                  entidade: u.projetoId ? (projetoMap[u.projetoId] ?? '—') : 'Matriz',
                  perfil: perfilMap[u.perfilId] ?? u.perfilId,
                  status: (
                    <span className={`badge ${u.status === 'Ativo' ? 'badge-green' : ''}`} style={u.status === 'Inativo' ? { background: '#f1efee', color: '#5a4a3f' } : undefined}>
                      {u.status}
                    </span>
                  ),
                  acoes: acessoAdmin.editar ? (
                    <span style={{ display: 'flex', gap: 8 }}>
                      <button className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => toggleUsuarioStatus(u.id)}>
                        {u.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                      </button>
                      <button
                        className="btn"
                        style={{ fontSize: 11, padding: '4px 8px', color: '#a30000' }}
                        onClick={() => handleExcluirUsuario(u.id, u.nome)}
                      >
                        Excluir
                      </button>
                    </span>
                  ) : (
                    '—'
                  ),
                }))}
              />
            </div>
          </>
        )}

        {active === 'grupos' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Grupos
              </div>
              {acessoAdmin.editar && (
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
                  onClick={() => setOpenModal('grupo')}
                >
                  + Novo grupo
                </button>
              )}
            </div>
            <DataTable
              columns={GRUPOS_COLUMNS}
              rows={grupos.map((g) => ({
                nome: <b>{g.nome}</b>,
                descricao: g.descricao,
                membros: usuarios.filter((u) => u.grupoId === g.id).length,
                solicitante: <Flag on={g.visivelComoSolicitante} />,
                atribuicao: <Flag on={g.visivelComoAtribuicao} />,
                notificacao: <Flag on={g.podeSerNotificado} />,
              }))}
            />
          </>
        )}

        {active === 'fornecedores' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Fornecedores
              </div>
              {acessoAdmin.editar && (
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
                  onClick={() => setOpenModal('fornecedor')}
                >
                  + Novo fornecedor
                </button>
              )}
            </div>
            <DataTable
              columns={FORNECEDORES_COLUMNS}
              rows={fornecedores.map((f) => ({
                empresa: (
                  <span>
                    <b>{f.empresa}</b>
                    {f.site && (
                      <>
                        <br />
                        <a href={f.site} target="_blank" rel="noreferrer" style={{ fontSize: 11 }}>
                          {f.site}
                        </a>
                      </>
                    )}
                  </span>
                ),
                tipo: <span className="badge badge-blue">{f.tipo}</span>,
                servico: f.servico,
                contato: (
                  <span>
                    {f.email}
                    <br />
                    {f.telefone}
                  </span>
                ),
                local: [f.cidade, f.estado].filter(Boolean).join('/') || '—',
              }))}
            />
          </>
        )}
      </div>

      {openModal === 'usuario' && <NovoUsuarioModal onClose={() => setOpenModal(null)} defaultProjetoId={currentProject?.id} />}
      {openModal === 'grupo' && <NovoGrupoModal onClose={() => setOpenModal(null)} />}
      {openModal === 'fornecedor' && <NovoFornecedorModal onClose={() => setOpenModal(null)} />}
      {openModal === 'perfil' && (
        <NovoPerfilModal
          onClose={() => setOpenModal(null)}
          onCreated={(id) => {
            setOpenModal(null)
            setActive('perfis')
            setSelectedPerfilId(id)
          }}
        />
      )}
    </SectionSidebarLayout>
  )
}
