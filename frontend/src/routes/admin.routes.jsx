import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import Dashboard from '../pages/admin/Dashboard.jsx'
import Secretaries from '../pages/admin/Secretaries.jsx'

// Owner: Dev 2 (F2)
export default {
  path: '/admin',
  element: (
    <ProtectedRoute roles={['admin']}>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Dashboard />, handle: { title: 'Dashboard' } },
    { path: 'secretaries', element: <Secretaries />, handle: { title: 'Secretary accounts' } },
  ],
}
