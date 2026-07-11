import { useState } from 'react'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { useAdminStore } from '@/store/useAdminStore'
import { useModuleAccess } from '@/store/usePermissions'
import { useAuthStore } from '@/store/useAuthStore'
import { useProjectStore } from '@/store/useProjectStore'
import { useAllProjects } from '@/store/useCatalogStore'
import PermissionMatrixEditor from './PermissionMatrixEditor'
import UsuarioFormModal from './UsuarioFormModal'
import NovoGrupoModal from './NovoGrupoModal'
import NovoFornecedorModal from './NovoFornecedorModal'
import NovoPerfilModal from './NovoPerfilModal'
import GrupoMembrosPanel from './GrupoMembrosPanel'
import ListasSuspensasPanel from './ListasSuspensasPanel'
import NiveisServicoPanel from './NiveisServicoPanel'
import type { Usuario } from '@/data/administracaoMock'

type Section = 'perfis' | 'usuarios' | 'grupos' | 'fornecedores' | 'listas-suspensas' | 'niveis-servico'
type OpenModal = 'usuario' | 'grupo' | 'fornecedor' | 'perfil' | null

const TABS: { key: Section; label: string }[] = [
  { key: 'perfis', label: 'Perfis' },
  { key: 'usuarios', label: 'Usuários' },
  { key: 'grupos', label: 'Grupos' },
  { key: 'fornecedores', label: 'Fornecedores' },
  { key: 'listas-suspensas', label: 'Listas Suspensas' },
  { key: 'niveis-servico', label: 'Níveis de Serviço' },
]

const PERFIS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'entidade', label: 'Entidade', width: '150px' },
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
  { key: 'entidade', label: 'Entidade', width: '150px' },
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
  { key: 'entidade', label: 'Entidade', width: '150px' },
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
  const [entidadeFiltroGrupos, setEntidadeFiltroGrupos] = useState(currentProject?.id ?? '')
  const [entidadeFiltroPerfis, setEntidadeFiltroPerfis] = useState(currentProject?.id ?? '')
  const [entidadeFiltroFornecedores, setEntidadeFiltroFornecedores] = useState(currentProject?.id ?? '')
  const [selectedGrupoId, setSelectedGrupoId] = useState<string | null>(null)
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null)

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
  const gruposFiltrados = entidadeFiltroGrupos ? grupos.filter((g) => g.projetoId === entidadeFiltroGrupos) : grupos
  const perfisFiltrados = entidadeFiltroPerfis ? perfis.filter((p) => p.projetoId === entidadeFiltroPerfis) : perfis
  const fornecedoresFiltrados = entidadeFiltroFornecedores
    ? fornecedores.filter((f) => f.projetoId === entidadeFiltroFornecedores)
    : fornecedores
  const selectedGrupo = grupos.find((g) => g.id === selectedGrupoId) ?? null

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
    <div className="mod-page" style={{ height: '100%' }}>
      <div className="mod-page-tabs">
        {TABS.map((t) => (
          <span key={t.key} className={`chip${active === t.key ? ' on' : ''}`} onClick={() => setActive(t.key)}>
            {t.label}
          </span>
        ))}
      </div>
      <div className="mod-page-body">
      <div className="mod-scroll-area">
        {active === 'perfis' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Perfis de acesso
              </div>
              <select
                value={entidadeFiltroPerfis}
                onChange={(e) => setEntidadeFiltroPerfis(e.target.value)}
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
                  onClick={() => setOpenModal('perfil')}
                >
                  + Novo perfil
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 12, maxWidth: 620 }}>
              Os 8 perfis padrão de uma instalação GLPI (Super-Admin, Admin, Supervisor, Technician, Hotliner,
              Observer, Read-Only, Self-Service), adaptados aos módulos deste sistema, ficam disponíveis para
              todos os projetos. Um perfil customizado pode nascer vinculado a um projeto só, como se cada
              unidade tivesse sua própria camada de configuração de acesso. Clique num perfil para ver ou
              ajustar o que ele pode visualizar e editar em cada módulo.
            </div>
            <div className="table-scroll">
              <DataTable
                columns={PERFIS_COLUMNS}
                emptyText="Nenhum perfil nesta entidade."
                rows={perfisFiltrados.map((p) => ({
                  nome: (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <b>{p.nome}</b>
                      {p.builtIn && <span className="badge badge-blue">Fábrica</span>}
                    </span>
                  ),
                  descricao: p.descricao,
                  entidade: p.projetoId ? (projetoMap[p.projetoId] ?? '—') : 'Todos os projetos',
                  usuarios: usuarios.filter((u) => u.perfilId === p.id).length,
                }))}
                onRowClick={(i) => setSelectedPerfilId(perfisFiltrados[i].id)}
                selectedIndex={selectedPerfilId ? perfisFiltrados.findIndex((p) => p.id === selectedPerfilId) : undefined}
              />
            </div>
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
                      <button className="btn" style={{ fontSize: 11, padding: '4px 8px' }} onClick={() => setEditingUsuario(u)}>
                        Editar
                      </button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Grupos
              </div>
              <select
                value={entidadeFiltroGrupos}
                onChange={(e) => setEntidadeFiltroGrupos(e.target.value)}
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
                  onClick={() => setOpenModal('grupo')}
                >
                  + Novo grupo
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 12, maxWidth: 620 }}>
              Grupos também funcionam como departamentos de uma unidade — por exemplo, "TIC" no projeto
              "Eu Tenho Futuro — Osasco". Um grupo sem entidade é global (matriz).
            </div>
            <div className="table-scroll">
              <DataTable
                columns={GRUPOS_COLUMNS}
                emptyText="Nenhum grupo nesta entidade."
                rows={gruposFiltrados.map((g) => ({
                  nome: <b>{g.nome}</b>,
                  descricao: g.descricao,
                  entidade: g.projetoId ? (projetoMap[g.projetoId] ?? '—') : 'Matriz',
                  membros: usuarios.filter((u) => u.grupoIds?.includes(g.id)).length,
                  solicitante: <Flag on={g.visivelComoSolicitante} />,
                  atribuicao: <Flag on={g.visivelComoAtribuicao} />,
                  notificacao: <Flag on={g.podeSerNotificado} />,
                }))}
                onRowClick={(i) => setSelectedGrupoId(gruposFiltrados[i].id)}
                selectedIndex={selectedGrupoId ? gruposFiltrados.findIndex((g) => g.id === selectedGrupoId) : undefined}
              />
            </div>
            {selectedGrupo && <GrupoMembrosPanel grupo={selectedGrupo} canEdit={acessoAdmin.editar} />}
          </>
        )}

        {active === 'fornecedores' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Fornecedores
              </div>
              <select
                value={entidadeFiltroFornecedores}
                onChange={(e) => setEntidadeFiltroFornecedores(e.target.value)}
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
                  onClick={() => setOpenModal('fornecedor')}
                >
                  + Novo fornecedor
                </button>
              )}
            </div>
            <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 12, maxWidth: 620 }}>
              Um fornecedor pode ser global (usado por todos os projetos) ou vinculado a uma entidade
              específica — por exemplo, um provedor de link de internet contratado só para uma unidade.
            </div>
            <div className="table-scroll">
              <DataTable
                columns={FORNECEDORES_COLUMNS}
                emptyText="Nenhum fornecedor nesta entidade."
                rows={fornecedoresFiltrados.map((f) => ({
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
                  entidade: f.projetoId ? (projetoMap[f.projetoId] ?? '—') : 'Todos os projetos',
                  local: [f.cidade, f.estado].filter(Boolean).join('/') || '—',
                }))}
              />
            </div>
          </>
        )}

        {active === 'listas-suspensas' && <ListasSuspensasPanel canEdit={acessoAdmin.editar} />}
        {active === 'niveis-servico' && <NiveisServicoPanel canEdit={acessoAdmin.editar} />}
      </div>
      </div>

      {openModal === 'usuario' && <UsuarioFormModal onClose={() => setOpenModal(null)} defaultProjetoId={currentProject?.id} />}
      {editingUsuario && <UsuarioFormModal usuario={editingUsuario} onClose={() => setEditingUsuario(null)} />}
      {openModal === 'grupo' && <NovoGrupoModal onClose={() => setOpenModal(null)} defaultProjetoId={currentProject?.id} />}
      {openModal === 'fornecedor' && <NovoFornecedorModal onClose={() => setOpenModal(null)} defaultProjetoId={currentProject?.id} />}
      {openModal === 'perfil' && (
        <NovoPerfilModal
          onClose={() => setOpenModal(null)}
          defaultProjetoId={currentProject?.id}
          onCreated={(id) => {
            setOpenModal(null)
            setActive('perfis')
            setSelectedPerfilId(id)
          }}
        />
      )}
    </div>
  )
}
