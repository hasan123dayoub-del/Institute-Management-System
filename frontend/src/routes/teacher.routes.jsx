import { Navigate } from 'react-router'
import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import { lazyPage } from './lazyPage.js'

// Owner: Dev 2 (F2)
export default {
  path: '/teacher',
  element: (
    <ProtectedRoute roles={['teacher']}>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="schedule" replace /> },
    { path: 'schedule', ...lazyPage(() => import('../pages/teacher/Schedule.jsx')), handle: { title: 'My weekly timetable' } },
    { path: 'grades', ...lazyPage(() => import('../pages/teacher/Grades.jsx')), handle: { title: 'Enter grades' } },
  ],
}
