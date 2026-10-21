import { api } from './client.js'
import { LIVE } from './mode.js'
import * as sample from './sample/api.js'

// Everything here is for the logged in teacher and their own classes.
// The pages always see this shape:
//   session = { id, class_id, class:{ id, level, shift, status, room }, day, start_time, end_time, course_end_date }
//   add / move / remove answer { course_end_date } (the end date recomputed after the change)

// The backend (branch feat/p3-course-results) answers with raw documents: `_id`, a populated class,
// and camelCase `courseEndDate`. These adapters translate that into the shape above.
const toSession = (s) => {
  const cls = s.class_id ?? {}
  return {
    id: s._id,
    class_id: cls._id,
    class: { id: cls._id, level: cls.level_id?.code, shift: cls.shift, status: cls.status, room: cls.room },
    day: s.day,
    start_time: s.start_time,
    end_time: s.end_time,
    course_end_date: s.courseEndDate ?? null,
  }
}

const real = {
  list: async (params) => (await api.get('/schedules', params)).schedules.map(toSession),
  add: async (data) => {
    const r = await api.post('/schedules', data) // { class_id, day, start_time, end_time }
    return { id: r.schedule._id, course_end_date: r.courseEndDate ?? null }
  },
  move: async (id, data) => {
    const r = await api.patch(`/schedules/${id}`, data) // { day, start_time, end_time }; 409 on a clash
    return { id, course_end_date: r.courseEndDate ?? null }
  },
  remove: async (id) => {
    const r = await api.delete(`/schedules/${id}`)
    return { course_end_date: r.courseEndDate ?? null }
  },
}

const impl = LIVE.schedules ? real : sample.schedules
export const list = impl.list
export const add = impl.add
export const move = impl.move
export const remove = impl.remove
