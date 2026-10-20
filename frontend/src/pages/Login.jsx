import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { homeFor } from '../auth/roles.js'
import { useAuth } from '../auth/useAuth.js'
import Field from '../components/Field.jsx'
import Logo from '../layouts/Logo.jsx'
import ThemeToggle from '../theme/ThemeToggle.jsx'
import './Login.css'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to={homeFor(user.role)} replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const loggedIn = await login(email, password)
      navigate(homeFor(loggedIn.role), { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login">
      <aside className="login-art">
        <div className="login-brand">
          <Logo size={44} />
          <span>Ascend</span>
        </div>
        <div>
          <p className="login-tag">English,<br />one level at a time</p>
          <p className="mono login-levels">A1 → A2 → B1 → B2 → C1 → C2</p>
        </div>
        <small>Ascend English Academy</small>
      </aside>

      <form className="login-form" onSubmit={onSubmit}>
        <div className="login-theme"><ThemeToggle /></div>
        <h2>Welcome back</h2>
        <p style={{ color: 'var(--muted)' }}>Sign in to continue</p>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <Field label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        {error && <p className="notice" role="alert" style={{ color: 'var(--bad)' }}>{error}</p>}
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <small>Forgot your password? Ask the front desk.</small>
      </form>
    </div>
  )
}
