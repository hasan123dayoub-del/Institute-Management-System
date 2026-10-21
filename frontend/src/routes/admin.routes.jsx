import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import { lazyPage } from './lazyPage.js'

// Owner: Dev 2 (F2)
export default {
  path: '/admin',
  element: (
    <ProtectedRoute roles={['admin']}>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [
    // the dashboard (and the chart library) is downloaded only when an admin opens it
    { index: true, ...lazyPage(() => import('../pages/admin/Dashboard.jsx')), handle: { title: 'Dashboard' } },
    { path: 'secretaries', ...lazyPage(() => import('../pages/admin/Secretaries.jsx')), handle: { title: 'Secretary accounts' } },
  ],
}
