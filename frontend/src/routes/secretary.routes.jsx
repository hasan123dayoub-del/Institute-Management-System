import { Navigate } from 'react-router'
import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import { lazyPage } from './lazyPage.js'

// Owner: Hasan (F1)
export default {
  path: '/secretary',
  element: (
    <ProtectedRoute roles={['secretary']}>
      <AppShell />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="students" replace /> },
    { path: 'students', ...lazyPage(() => import('../pages/secretary/Students.jsx')), handle: { title: 'Students' } },
    { path: 'students/new', ...lazyPage(() => import('../pages/secretary/RegisterStudent.jsx')), handle: { title: 'Register a new student' } },
    { path: 'classes', ...lazyPage(() => import('../pages/secretary/Classes.jsx')), handle: { title: 'Classes' } },
    { path: 'classes/:id', ...lazyPage(() => import('../pages/secretary/ClassDetail.jsx')), handle: { title: 'Class' } },
    { path: 'teachers', ...lazyPage(() => import('../pages/secretary/Teachers.jsx')), handle: { title: 'Teachers & salaries' } },
  ],
}
