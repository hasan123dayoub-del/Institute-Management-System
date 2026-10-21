import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from './useTheme.js'

const CONFIG = {
  light: { label: 'Light', Icon: Sun },
  dark: { label: 'Dark', Icon: Moon },
  system: { label: 'System', Icon: Monitor },
}

// One button that cycles light -> dark -> system.
export default function ThemeToggle() {
  const { mode, cycle } = useTheme()
  const { label, Icon } = CONFIG[mode]
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={cycle}
      aria-label={`Theme: ${label}. Click to change.`}
      title={`Theme: ${label}`}
    >
      <Icon aria-hidden="true" />
      {label}
    </Button>
  )
}
