// Side menu per role. `to` is absolute; `end` makes NavLink match the exact path only.
export const MENUS = {
  admin: [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/secretaries', label: 'Secretary accounts' },
  ],
  secretary: [
    { to: '/secretary/students', label: 'Students', end: true },
    { to: '/secretary/students/new', label: 'Register student' },
    { to: '/secretary/classes', label: 'Classes' },
    { to: '/secretary/teachers', label: 'Teachers & salaries' },
  ],
  teacher: [
    { to: '/teacher/schedule', label: 'My timetable' },
    { to: '/teacher/grades', label: 'Grades' },
  ],
  student: [{ to: '/student', label: 'My dashboard', end: true }],
}

export const ROLE_LABEL = {
  admin: 'Admin',
  secretary: 'Secretary',
  teacher: 'Teacher',
  student: 'Student',
}
