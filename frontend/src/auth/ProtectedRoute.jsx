import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './useAuth.js'

// <ProtectedRoute roles={['secretary']} /> wraps a role's routes.
// Not logged in -> /login. Wrong role -> /forbidden.
export default function ProtectedRoute({ roles, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="m-6 text-sm text-muted-foreground">Loading…</p>
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  if (roles && !roles.includes(user.role)) return <Navigate to="/forbidden" replace />
  return children ?? <Outlet />
}
