import { api } from './client.js'
import { LIVE } from './mode.js'
import * as sample from './sample/api.js'
import * as usersApi from './users.js'

// Contract proposed to the backend (P2). Every student looks like:
// { id, user_id, full_name, email, phone, gender, birth_date, address, guardian_phone, placement_score,
//   level:'B1', status:'waiting'|'active'|'withdrawn'|'graduated',
//   class:{ id, label, level, shift, status } | null, grades_count }
const real = {
  list: (params) => api.get('/students', params), // { status, level, shift }
  create: (data) => api.post('/students', data), // data has the account password, level and class_id (or null = waiting list)
  update: (id, data) => api.patch(`/students/${id}`, data),
  move: (id, classId) => api.patch(`/students/${id}/class`, { class_id: classId }), // same level, class open/running, not full
  remove: (id) => api.delete(`/students/${id}`), // 409 if the student has grades
  setPassword: (userId, password) => usersApi.setPassword(userId, password),
  // student portal: the student plus { class:{ id, level, shift, room, teacher_name, schedule, start_date,
  // sessions_done, total_sessions, course_end_date } | null, grades:{ oral, midterm, final } }
  me: () => api.get('/students/me'),
}

const impl = LIVE.students ? real : sample.students
export const list = impl.list
export const create = impl.create
export const update = impl.update
export const move = impl.move
export const remove = impl.remove
export const setPassword = impl.setPassword
export const me = impl.me
