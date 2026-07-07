import { Outlet } from 'react-router-dom'
import TopBar from './TopBar'
import ModuleTabs from './ModuleTabs'

export default function AppShell() {
  return (
    <div className="itsm active">
      <div className="main-area">
        <TopBar />
        <ModuleTabs />
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
