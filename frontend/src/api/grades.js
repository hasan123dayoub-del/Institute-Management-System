import { api } from './client.js'

export const forClass = (classId) => api.get(`/grades/class/${classId}`)
export const save = (classId, exam, grades) =>
  api.put(`/grades/class/${classId}`, { exam, grades })
