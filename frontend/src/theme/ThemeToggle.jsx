import { useTheme } from './useTheme.js'

const LABELS = { light: 'Light', dark: 'Dark', system: 'System' }
const ICONS = { light: '☀', dark: '☾', system: '◐' }

// One button that cycles light -> dark -> system.
export default function ThemeToggle() {
  const { mode, cycle } = useTheme()
  return (
    <button
      type="button"
      className="btn ghost sm"
      onClick={cycle}
      aria-label={`Theme: ${LABELS[mode]}. Click to change.`}
      title={`Theme: ${LABELS[mode]}`}
    >
      <span aria-hidden="true">{ICONS[mode]}</span> {LABELS[mode]}
    </button>
  )
}
