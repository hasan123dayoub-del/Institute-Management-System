import { api } from './client.js'

export const list = () => api.get('/teachers')
export const create = (data) => api.post('/teachers', data) // includes password and salary
export const update = (id, data) => api.patch(`/teachers/${id}`, data)
export const pay = (id) => api.post(`/teachers/${id}/pay`) // 409 if already paid this month
