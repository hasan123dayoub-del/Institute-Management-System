import { api } from './client.js'

// Admin only.
export const list = () => api.get('/secretaries')
export const create = (data) => api.post('/secretaries', data)
export const update = (id, data) => api.patch(`/secretaries/${id}`, data)
export const remove = (id) => api.delete(`/secretaries/${id}`) // 409 for the last active secretary
