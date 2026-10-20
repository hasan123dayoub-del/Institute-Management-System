import { api } from './client.js'

export const forClass = (classId) => api.get(`/grades/class/${classId}`)
export const save = (classId, grades) => api.put(`/grades/class/${classId}`, { grades })
