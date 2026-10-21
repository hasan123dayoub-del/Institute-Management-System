import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// A password <Input> with an eye button inside it that shows or hides the text.
// It accepts every normal input prop (value, onChange, autoComplete, required...).
export default function PasswordInput({ className, ...props }) {
  // `visible` decides the input type: "text" shows the password, "password" hides it.
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      {/* pe-10 = padding at the end, so long passwords never go under the eye button */}
      <Input type={visible ? 'text' : 'password'} className={cn('pe-10', className)} {...props} />
      <Button
        type="button" // type="button" so it never submits the form
        variant="ghost"
        size="icon-sm"
        className="absolute inset-e-1 top-1/2 -translate-y-1/2 text-muted-foreground"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      </Button>
    </div>
  )
}
