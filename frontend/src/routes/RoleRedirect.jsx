import { Navigate } from 'react-router'
import { homeFor } from '../auth/roles.js'
import { useAuth } from '../auth/useAuth.js'

// "/" sends each role to its own area, and visitors to the login page.
export default function RoleRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />
}
