import { useCallback, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth.js'
import { AuthContext } from './AuthContext.js'
import { clearToken, getToken, setToken } from './token.js'

// user: the logged-in user ({ id, full_name, email, role }) or null.
// loading: true only while a saved token is being checked on first load.
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(getToken()))

  useEffect(() => {
    if (!getToken()) return
    authApi
      .me()
      .then(setUser)
      .catch(() => clearToken())
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener('ascend:unauthorized', onUnauthorized)
    return () => window.removeEventListener('ascend:unauthorized', onUnauthorized)
  }, [])

  const login = useCallback(async (email, password) => {
    const { token, user: loggedIn } = await authApi.login(email, password)
    setToken(token)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const logout = useCallback(() => {
    clearToken()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <AuthContext value={value}>{children}</AuthContext>
}
