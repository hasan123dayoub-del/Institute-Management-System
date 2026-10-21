import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
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
    {
      index: true,
      // lazy: the dashboard (and the chart library) is downloaded only when an admin opens it
      lazy: async () => ({ Component: (await import('../pages/admin/Dashboard.jsx')).default }),
      handle: { title: 'Dashboard' },
    },
    { path: 'secretaries', element: <Secretaries />, handle: { title: 'Secretary accounts' } },
  ],
}
