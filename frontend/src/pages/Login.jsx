import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { homeFor } from '@/auth/roles.js'
import { useAuth } from '@/auth/useAuth.js'
import Field from '@/components/Field.jsx'
import { Button } from '@/components/ui/button'
import Logo from '@/layouts/Logo.jsx'
import ThemeToggle from '@/theme/ThemeToggle.jsx'

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
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="flex min-h-48 flex-col justify-between gap-4 bg-brand-deep p-6 text-white md:p-10">
        <div className="flex items-center gap-2.5 font-display text-2xl">
          <Logo size={44} />
          <span>Ascend</span>
        </div>
        <div>
          <p className="font-display text-3xl leading-snug">
            English,
            <br />
            one level at a time
          </p>
          <p className="mt-2 font-mono text-sm opacity-70">A1 → A2 → B1 → B2 → C1 → C2</p>
        </div>
        <small className="text-white/60">Ascend English Academy</small>
      </aside>

      <form
        onSubmit={onSubmit}
        className="relative flex flex-col justify-center gap-4 bg-card px-6 py-10 md:px-[clamp(24px,8vw,80px)]"
      >
        <div className="absolute inset-e-4 top-4">
          <ThemeToggle />
        </div>
        <h2 className="text-2xl">Welcome back</h2>
        <p className="text-muted-foreground">Sign in to continue</p>
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        <Field label="Password" as="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        {error && (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</Button>
        <small className="text-muted-foreground">Forgot your password? Ask the front desk.</small>
      </form>
    </div>
  )
}
