import { api } from './client.js'

// Secretary. Paths follow the endpoint table in the design file; confirm in docs/api-contract.md.
export const list = (params) => api.get('/students', params) // { status, level, shift }
export const create = (data) => api.post('/students', data) // includes the account password
export const update = (id, data) => api.patch(`/students/${id}`, data)
export const placeInClass = (id, classId) => api.patch(`/students/${id}/class`, { class_id: classId })
export const remove = (id) => api.delete(`/students/${id}`) // 409 if the student has grades
export const getMe = () => api.get('/students/me') // student portal
