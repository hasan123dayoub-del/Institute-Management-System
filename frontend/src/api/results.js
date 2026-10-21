import { api } from './client.js'

export const history = (studentId) => api.get(`/results/student/${studentId}`)
