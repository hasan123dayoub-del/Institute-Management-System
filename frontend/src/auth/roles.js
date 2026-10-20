// Where each role lands after login.
export const ROLE_HOME = {
  admin: '/admin',
  secretary: '/secretary/students',
  teacher: '/teacher/schedule',
  student: '/student',
}

export const homeFor = (role) => ROLE_HOME[role] || '/login'
