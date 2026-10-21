import { ApiError } from '@/api/client.js'
import * as secretariesApi from '@/api/secretaries.js'
import * as usersApi from '@/api/users.js'
import { USE_SAMPLE_DATA } from './config.js'

// This file answers one question: where do the secretaries come from?
// It exports ONE object, `source`, with the same 5 functions in both modes,
// so the rest of the code never knows (or cares) whether the data is real.

// ---- sample mode: a fake "database" that lives in memory (resets on page reload) ----
let rows = [
  { id: 1, full_name: 'Salma Darwish', email: 'salma@ascend.academy', phone: '0944 501 220', is_active: true },
  { id: 2, full_name: 'Hiba Al-Zein', email: 'hiba@ascend.academy', phone: '0933 118 904', is_active: true },
  { id: 3, full_name: 'Reem Saadeh', email: 'reem@ascend.academy', phone: '0955 640 371', is_active: false },
]
let nextId = 4

const later = (value) => new Promise((resolve) => setTimeout(() => resolve(value), 250))
const conflict = (message, code) => Promise.reject(new ApiError(409, message, code))
const activeCount = () => rows.filter((r) => r.is_active).length

const sample = {
  list: () => later(rows.map((r) => ({ ...r }))),

  create: async ({ full_name, email, phone }) => {
    if (rows.some((r) => r.email === email.toLowerCase())) return conflict('This email is already used', 'DUPLICATE')
    rows = [...rows, { id: nextId++, full_name, email: email.toLowerCase(), phone, is_active: true }]
    return later(null)
  },

  update: async (id, changes) => {
    rows = rows.map((r) => (r.id === id ? { ...r, ...changes } : r))
    return later(null)
  },

  // Same rule as the backend: the last active secretary cannot be deleted.
  remove: async (id) => {
    const target = rows.find((r) => r.id === id)
    if (target?.is_active && activeCount() <= 1) {
      return conflict('Cannot delete the last active secretary', 'LAST_SECRETARY')
    }
    rows = rows.filter((r) => r.id !== id)
    return later(null)
  },

  setPassword: () => later(null),
}

// ---- real mode: the backend (see src/api/secretaries.js and users.js) ----
const real = {
  list: secretariesApi.list,
  create: secretariesApi.create,
  update: secretariesApi.update,
  remove: secretariesApi.remove,
  setPassword: usersApi.setPassword,
}

export const source = USE_SAMPLE_DATA ? sample : real
