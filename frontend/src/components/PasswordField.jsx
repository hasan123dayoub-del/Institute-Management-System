import { useId, useState } from 'react'

// Passwords are set by staff (backend rule: at least 8 characters), so the field can
// generate one and show it, to hand over to the user.
const CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generate(length = 10) {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('')
}

export default function PasswordField({ label = 'Password', value, onChange, error, hint = '8+ characters' }) {
  const id = useId()
  const [visible, setVisible] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        aria-invalid={error ? true : undefined}
      />
      <div className="row" style={{ gap: 8 }}>
        <button type="button" className="btn ghost sm" onClick={() => onChange(generate())}>
          Generate
        </button>
        <button type="button" className="btn ghost sm" onClick={() => setVisible((v) => !v)}>
          {visible ? 'Hide' : 'Show'}
        </button>
      </div>
      {error ? <span className="error" role="alert">{error}</span> : <span className="hint">{hint}</span>}
    </div>
  )
}
