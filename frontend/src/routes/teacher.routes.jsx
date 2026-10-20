import { Navigate } from 'react-router'
import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import Grades from '../pages/teacher/Grades.jsx'
import Schedule from '../pages/teacher/Schedule.jsx'

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
    { path: 'schedule', element: <Schedule />, handle: { title: 'My weekly timetable' } },
    { path: 'grades', element: <Grades />, handle: { title: 'Enter grades' } },
  ],
}
