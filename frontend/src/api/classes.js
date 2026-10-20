import { api } from './client.js'

export const list = (params) => api.get('/classes', params) // { status }
export const get = (id) => api.get(`/classes/${id}`)
export const create = (data) => api.post('/classes', data)
export const update = (id, data) => api.patch(`/classes/${id}`, data)
export const start = (id) => api.post(`/classes/${id}/start`) // open -> running
export const remove = (id) => api.delete(`/classes/${id}`) // only when open and empty
export const students = (id) => api.get(`/classes/${id}/students`)
