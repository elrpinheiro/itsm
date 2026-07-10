import { useLocation, useNavigate } from 'react-router-dom'
import { MODULES } from '@/modules/registry'
import { TEMPLATES } from '@/data/templates'
import { usePermissionMatrix, canSeeNavModule } from '@/store/usePermissions'

export default function ModuleTabs() {
  const location = useLocation()
  const navigate = useNavigate()
  const totalTemplates = TEMPLATES.length
  const permissionMatrix = usePermissionMatrix()
  const visibleModules = MODULES.filter((mod) => canSeeNavModule(permissionMatrix, mod.path))

  return (
    <div className="hdr-modbar">
      {visibleModules.map((mod) => {
        const active = location.pathname.startsWith(`/app/${mod.path}`)
        return (
          <div
            key={mod.key}
            className={`mod-tab${active ? ' on' : ''}`}
            onClick={() => navigate(`/app/${mod.path}`)}
          >
            <span className="ic">{mod.icon}</span> {mod.label}
          </div>
        )
      })}
      {location.pathname.startsWith('/app/ferramentas/documentos') && (
        <span className="badge badge-blue hdr-tpl-count" style={{ marginLeft: 'auto' }}>
          {totalTemplates} templates
        </span>
      )}
    </div>
  )
}
