import { useId } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

// Label + input + optional hint/error. Pass any <input> props.
// Use as="textarea" for a textarea. For a dropdown use shadcn's <Select> directly.
export default function Field({ label, hint, error, as = 'input', className, ...props }) {
  const id = useId()
  const Control = as === 'textarea' ? Textarea : Input
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
