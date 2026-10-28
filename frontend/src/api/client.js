import { clearToken, getToken } from '../auth/token.js'

// VITE_API_URL can be a full URL or a bare host (Render's blueprint passes the API host only).
const API_URL = import.meta.env.VITE_API_URL || ''
const BASE = `${API_URL && !/^https?:\/\//.test(API_URL) ? `https://${API_URL}` : API_URL}/api`

// The backend always answers errors as { message, code } (see backend/README.md).
export class ApiError extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

function buildUrl(path, params) {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params || {})) {
    if (value !== undefined && value !== null && value !== '') query.set(key, value)
  }
  const qs = query.toString()
  return `${BASE}${path}${qs ? `?${qs}` : ''}`
}

async function request(method, path, { params, body } = {}) {
  const token = getToken()
  let res
  try {
    res = await fetch(buildUrl(path, params), {
      method,
      headers: {
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the server', 'NETWORK')
  }

  const data = res.status === 204 ? null : await res.json().catch(() => null)

  if (!res.ok) {
    // An expired or invalid token anywhere logs the user out (AuthProvider listens).
    if (res.status === 401 && token) {
      clearToken()
      window.dispatchEvent(new Event('ascend:unauthorized'))
    }
    throw new ApiError(res.status, data?.message || 'Request failed', data?.code)
  }
  return data
}

export const api = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
}
