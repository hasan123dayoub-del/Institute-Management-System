const KEY = 'ascend-token'

export function getToken() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(KEY, token)
  } catch {
    /* storage unavailable: user will need to log in again after a reload */
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to clear */
  }
}
