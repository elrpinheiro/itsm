import { useLocation, useNavigate } from 'react-router-dom'
import { MODULES } from '@/modules/registry'
import { TEMPLATES } from '@/data/templates'
import { usePermissionMatrix, canSeeNavModule } from '@/store/usePermissions'

/** Barra de módulos persistente — funciona tanto dentro de um projeto (rotas /app/*) quanto na
 * visão global (rotas na raiz), navegando para a base certa conforme a URL atual. */
export default function ModuleTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const totalTemplates = TEMPLATES.length
  const permissionMatrix = usePermissionMatrix()
  const insideApp = location.pathname.startsWith('/app')
  const base = insideApp ? '/app/' : '/'
  const visibleModules = MODULES.filter((mod) =>
    mod.key === 'inicio' ? insideApp : canSeeNavModule(permissionMatrix, mod.path),
  )

  return (
    <div className="hdr-modbar">
      {visibleModules.map((mod) => {
        const active = location.pathname.startsWith(`${base}${mod.path}`)
        return (
          <button
            key={mod.key}
            type="button"
            className={`mod-tab${active ? ' on' : ''}`}
            onClick={() => navigate(`${base}${mod.path}`)}
          >
            <mod.icon className="ic" size={16} strokeWidth={2} />
            <span>{mod.label}</span>
          </button>
        )
      })}
      {location.pathname.includes('ferramentas/documentos') && (
        <span className="badge badge-blue hdr-tpl-count" style={{ marginLeft: 'auto' }}>
          {totalTemplates} templates
        </span>
      )}
    </div>
  )
}
