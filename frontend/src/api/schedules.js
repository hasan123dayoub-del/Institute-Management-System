import { api } from './client.js'

// Teacher, own classes only. Responses carry the recomputed course end date.
export const list = (params) => api.get('/schedules', params)
export const add = (data) => api.post('/schedules', data)
export const move = (id, data) => api.patch(`/schedules/${id}`, data) // 409 on clash
export const remove = (id) => api.delete(`/schedules/${id}`)
