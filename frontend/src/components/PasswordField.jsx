import { useId } from 'react'
import PasswordInput from '@/components/PasswordInput.jsx'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

// Passwords are set by staff (backend rule: at least 8 characters), so this field can
// generate one. Use it in forms that create or reset an account (not on the login page).
const CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'

function generate(length = 10) {
  const bytes = crypto.getRandomValues(new Uint32Array(length))
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('')
}

export default function PasswordField({ label = 'Password', value, onChange, error, hint = '8+ characters' }) {
  const id = useId()

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <PasswordInput
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        aria-invalid={error ? true : undefined}
      />
      <div>
        <Button type="button" variant="outline" size="xs" onClick={() => onChange(generate())}>
          Generate
        </Button>
      </div>
      {error ? (
        <span className="text-xs text-destructive" role="alert">{error}</span>
      ) : (
        <span className="text-xs text-muted-foreground">{hint}</span>
      )}
    </div>
  )
}
