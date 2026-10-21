import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        aria-invalid={error ? true : undefined}
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="xs" onClick={() => onChange(generate())}>
          Generate
        </Button>
        <Button type="button" variant="outline" size="xs" onClick={() => setVisible((v) => !v)}>
          {visible ? 'Hide' : 'Show'}
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
