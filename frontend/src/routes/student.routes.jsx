import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import { lazyPage } from './lazyPage.js'

// Owner: Dev 2 (F2)
export default {
  path: '/student',
  element: (
    <ProtectedRoute roles={['student']}>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [{ index: true, ...lazyPage(() => import('../pages/student/Portal.jsx')), handle: { title: 'My dashboard' } }],
}
