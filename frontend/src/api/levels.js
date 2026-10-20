import { api } from './client.js'

export const list = () => api.get('/levels')
