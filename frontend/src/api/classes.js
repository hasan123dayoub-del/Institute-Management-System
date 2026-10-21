import { api } from './client.js'
import { LIVE } from './mode.js'
import * as sample from './sample/api.js'

// Contract proposed to the backend (P2). Every class looks like:
// { id, level:'B1', shift:'evening', room, capacity, start_date, status:'open'|'running'|'finished',
//   teacher:{id, full_name}, students_count, total_sessions, sessions_done,
//   last_session_date, closes_on, schedule:[{day,start_time,end_time}] }
// total_sessions, sessions_done and the dates are computed by the server from the timetable.
const real = {
  list: (params) => api.get('/classes', params), // { status }
  mine: () => api.get('/classes'), // a teacher only receives their own classes
  get: (id) => api.get(`/classes/${id}`),
  // students of the class, with their grades FOR THIS CLASS: { id, user_id, full_name, phone, level, status, grades:{oral,midterm,final}, grades_count }
  students: (id) => api.get(`/classes/${id}/students`),
  create: (data) => api.post('/classes', data), // { level, shift, teacher_id, room, capacity, start_date }
  update: (id, data) => api.patch(`/classes/${id}`, data), // { teacher_id, room, capacity }
  start: (id) => api.post(`/classes/${id}/start`), // open -> running
  remove: (id) => api.delete(`/classes/${id}`), // 409 unless open and empty
}

const impl = LIVE.classes ? real : sample.classes
export const list = impl.list
export const mine = impl.mine
export const get = impl.get
export const students = impl.students
export const create = impl.create
export const update = impl.update
export const start = impl.start
export const remove = impl.remove
