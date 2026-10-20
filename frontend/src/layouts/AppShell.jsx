import { NavLink, Outlet, useMatches, useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth.js'
import ThemeToggle from '../theme/ThemeToggle.jsx'
import Logo from './Logo.jsx'
import { MENUS, ROLE_LABEL } from './menus.js'
import './AppShell.css'

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
    <div className="shell">
      <nav className="shell-side" aria-label="Main menu">
        <div className="shell-logo">
          <Logo />
          <span>Ascend</span>
        </div>
        {MENUS[user.role].map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="shell-main">
        <header className="shell-top">
          <h1>{title}</h1>
          <div className="shell-user">
            <ThemeToggle />
            <span>
              {user.full_name} · <small>{ROLE_LABEL[user.role]}</small>
            </span>
            <button type="button" className="btn ghost sm" onClick={onLogout}>
              Log out
            </button>
          </div>
        </header>
        <main className="shell-page">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
