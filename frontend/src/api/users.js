import { api } from './client.js'

// Admin sets secretary passwords, secretary sets teacher/student passwords. Nobody sets their own.
export const setPassword = (id, password) => api.patch(`/users/${id}/password`, { password })
