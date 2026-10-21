import { useId } from 'react'
import PasswordInput from '@/components/PasswordInput.jsx'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const CONTROLS = { input: Input, textarea: Textarea, password: PasswordInput }

// Label + control + optional hint/error. Pass any <input> props.
//   <Field label="Email" type="email" ... />
//   <Field label="Password" as="password" ... />   (has the show/hide eye button)
//   <Field label="Notes" as="textarea" ... />
// For a dropdown use shadcn's <Select> directly.
export default function Field({ label, hint, error, as = 'input', className, ...props }) {
  const id = useId()
  const Control = CONTROLS[as]
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className ?? ''}`}>
      <Label htmlFor={id}>{label}</Label>
      <Control id={id} aria-invalid={error ? true : undefined} {...props} />
      {hint && !error && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && (
        <span className="text-xs text-destructive" role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
