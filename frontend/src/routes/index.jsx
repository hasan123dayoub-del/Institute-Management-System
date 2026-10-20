import { createBrowserRouter } from 'react-router'
import Forbidden from '../pages/Forbidden.jsx'
import Login from '../pages/Login.jsx'
import NotFound from '../pages/NotFound.jsx'
import adminRoutes from './admin.routes.jsx'
import RoleRedirect from './RoleRedirect.jsx'
import secretaryRoutes from './secretary.routes.jsx'
import studentRoutes from './student.routes.jsx'
import teacherRoutes from './teacher.routes.jsx'

// One file of routes per role, so the two frontend developers never edit the same file.
export const router = createBrowserRouter([
  { path: '/', element: <RoleRedirect /> },
  { path: '/login', element: <Login /> },
  { path: '/forbidden', element: <Forbidden /> },
  secretaryRoutes,
  adminRoutes,
  teacherRoutes,
  studentRoutes,
  { path: '*', element: <NotFound /> },
])
