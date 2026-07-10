import { useState } from 'react'
import SectionSidebarLayout, { type SectionSidebarItem } from '@/components/layout/SectionSidebarLayout'
import DataTable, { type DataTableColumn } from '@/components/common/DataTable'
import { GRUPOS, FORNECEDORES } from '@/data/administracaoMock'
import { useAdminStore } from '@/store/useAdminStore'
import { useModuleAccess } from '@/store/usePermissions'
import PermissionMatrixEditor from './PermissionMatrixEditor'
import NovoUsuarioModal from './NovoUsuarioModal'

type Section = 'perfis' | 'usuarios' | 'grupos' | 'fornecedores'

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
  { key: 'email', label: 'E-mail' },
  { key: 'login', label: 'Login', width: '130px' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'origem', label: 'Origem', width: '90px' },
  { key: 'status', label: 'Status', width: '90px' },
]

const GRUPOS_COLUMNS: DataTableColumn[] = [
  { key: 'nome', label: 'Nome do grupo' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'membros', label: 'Membros', width: '90px' },
]

const FORNECEDORES_COLUMNS: DataTableColumn[] = [
  { key: 'empresa', label: 'Empresa' },
  { key: 'servico', label: 'Serviço' },
  { key: 'contato', label: 'Contato' },
  { key: 'telefone', label: 'Telefone', width: '150px' },
]

export default function AdministracaoModule() {
  const [active, setActive] = useState<Section>('perfis')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPerfilId, setSelectedPerfilId] = useState<string | null>(null)

  const perfis = useAdminStore((s) => s.perfis)
  const usuarios = useAdminStore((s) => s.usuarios)
  const updatePermissao = useAdminStore((s) => s.updatePermissao)
  const acessoAdmin = useModuleAccess('administracao')

  const perfilMap = Object.fromEntries(perfis.map((p) => [p.id, p.nome]))
  const selectedPerfil = perfis.find((p) => p.id === selectedPerfilId) ?? null

  return (
    <SectionSidebarLayout title="Administração" items={ITEMS} active={active} onSelect={(k) => setActive(k as Section)}>
      <div className="mod-scroll-area">
        {active === 'perfis' && (
          <>
            <div className="mod-section-title">Perfis de acesso</div>
            <div style={{ fontSize: 12, color: 'var(--texto-sec)', marginBottom: 12, maxWidth: 620 }}>
              Cada perfil funciona como um marcador de módulos (inspirado na matriz de perfis do GLPI): clique
              num perfil para ver ou ajustar o que ele pode visualizar e editar em cada módulo.
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
              <PermissionMatrixEditor
                perfil={selectedPerfil}
                canEdit={acessoAdmin.editar}
                onChange={(matriz) => updatePermissao(selectedPerfil.id, matriz)}
              />
            )}
          </>
        )}

        {active === 'usuarios' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div className="mod-section-title" style={{ marginBottom: 0 }}>
                Usuários
              </div>
              {acessoAdmin.editar && (
                <button
                  className="btn btn-primary"
                  style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12.5 }}
                  onClick={() => setModalOpen(true)}
                >
                  + Novo usuário
                </button>
              )}
            </div>
            <DataTable
              columns={USUARIOS_COLUMNS}
              rows={usuarios.map((u) => ({
                nome: <b>{u.nome}</b>,
                email: u.email,
                login: u.login,
                perfil: perfilMap[u.perfilId] ?? u.perfilId,
                origem: <span className={`badge ${u.origem === 'LDAP' ? 'badge-blue' : 'badge-green'}`}>{u.origem}</span>,
                status: (
                  <span className={`badge ${u.status === 'Ativo' ? 'badge-green' : ''}`} style={u.status === 'Inativo' ? { background: '#f1efee', color: '#5a4a3f' } : undefined}>
                    {u.status}
                  </span>
                ),
              }))}
            />
          </>
        )}

        {active === 'grupos' && (
          <>
            <div className="mod-section-title">Grupos</div>
            <DataTable
              columns={GRUPOS_COLUMNS}
              rows={GRUPOS.map((g) => ({ nome: <b>{g.nome}</b>, descricao: g.descricao, membros: g.membros }))}
            />
          </>
        )}

        {active === 'fornecedores' && (
          <>
            <div className="mod-section-title">Fornecedores</div>
            <DataTable
              columns={FORNECEDORES_COLUMNS}
              rows={FORNECEDORES.map((f) => ({ empresa: <b>{f.empresa}</b>, servico: f.servico, contato: f.contato, telefone: f.telefone }))}
            />
          </>
        )}
      </div>

      {modalOpen && <NovoUsuarioModal onClose={() => setModalOpen(false)} />}
    </SectionSidebarLayout>
  )
}
