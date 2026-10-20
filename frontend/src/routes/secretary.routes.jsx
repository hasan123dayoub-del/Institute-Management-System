import { Navigate } from 'react-router'
import ProtectedRoute from '../auth/ProtectedRoute.jsx'
import AppShell from '../layouts/AppShell.jsx'
import ClassDetail from '../pages/secretary/ClassDetail.jsx'
import Classes from '../pages/secretary/Classes.jsx'
import RegisterStudent from '../pages/secretary/RegisterStudent.jsx'
import Students from '../pages/secretary/Students.jsx'
import Teachers from '../pages/secretary/Teachers.jsx'

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
    { path: 'students', element: <Students />, handle: { title: 'Students' } },
    { path: 'students/new', element: <RegisterStudent />, handle: { title: 'Register a new student' } },
    { path: 'classes', element: <Classes />, handle: { title: 'Classes' } },
    { path: 'classes/:id', element: <ClassDetail />, handle: { title: 'Class' } },
    { path: 'teachers', element: <Teachers />, handle: { title: 'Teachers & salaries' } },
  ],
}
