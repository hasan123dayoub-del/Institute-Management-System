import { api } from './client.js'

export const overview = () => api.get('/stats/overview') // admin dashboard
