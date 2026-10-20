import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import Portal from '../pages/student/Portal.jsx'

// Owner: Dev 2 (F2)
export default {
  path: '/student',
  element: (
    <ProtectedRoute roles={['student']}>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [{ index: true, element: <Portal />, handle: { title: 'My dashboard' } }],
}
