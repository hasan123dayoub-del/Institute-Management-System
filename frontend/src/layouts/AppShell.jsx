import { LogOut } from 'lucide-react'
import { NavLink, Outlet, useMatches, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth.js'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import ThemeToggle from '@/theme/ThemeToggle.jsx'
import Logo from './Logo.jsx'
import { MENUS, ROLE_LABEL } from './menus.js'

// Sidebar + top bar shared by all four roles. The page title comes from the
// route's `handle: { title }` (see src/routes/*.routes.jsx).
export default function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const matches = useMatches()
  const title = [...matches].reverse().find((m) => m.handle?.title)?.handle.title

  const onLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="grid min-h-screen md:grid-cols-[232px_1fr]">
      <nav
        aria-label="Main menu"
        className="flex items-center gap-1 overflow-x-auto bg-sidebar p-3 text-sidebar-foreground md:sticky md:top-0 md:h-screen md:flex-col md:items-stretch md:overflow-y-auto"
      >
        <div className="flex items-center gap-2 pe-3 ps-1.5 font-display text-xl md:pb-4 md:pe-0">
          <Logo />
          <span>Ascend</span>
        </div>
        {MENUS[user.role].map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'opacity-80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:opacity-100',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex min-w-0 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 md:px-6">
          <h1 className="text-xl font-medium">{title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <span className="text-sm">
              {user.full_name} <span className="text-muted-foreground">· {ROLE_LABEL[user.role]}</span>
            </span>
            <Button type="button" variant="outline" size="sm" onClick={onLogout}>
              <LogOut aria-hidden="true" />
              Log out
            </Button>
          </div>
        </header>
        <main className="flex flex-col gap-4 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
