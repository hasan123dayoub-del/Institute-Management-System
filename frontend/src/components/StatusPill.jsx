import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// Tones use the brand colours from src/index.css, so they follow light/dark by themselves.
const TONES = {
  neutral: 'bg-muted text-muted-foreground',
  ok: 'bg-success-soft text-success',
  warn: 'bg-warning-soft text-warning',
  bad: 'bg-danger-soft text-destructive',
  info: 'bg-accent text-primary',
}

// One place that maps backend enum values to a label and a tone.
const MAP = {
  // class.status
  open: ['Open', 'neutral'],
  running: ['Running', 'ok'],
  finished: ['Finished', 'info'],
  // student.status
  waiting: ['Waiting', 'warn'],
  active: ['Studying', 'ok'],
  withdrawn: ['Withdrawn', 'neutral'],
  graduated: ['Graduated', 'info'],
  // teacher.salary_status
  paid: ['Paid', 'ok'],
  unpaid: ['Unpaid', 'bad'],
  // class.shift
  morning: ['Morning', 'warn'],
  evening: ['Evening', 'info'],
  // exam result (frontend only)
  passed: ['Passed', 'ok'],
  failed: ['Failed', 'bad'],
}

export default function StatusPill({ value, label, className }) {
  const [text, tone] = MAP[value] ?? [value, 'neutral']
  return <Badge className={cn(TONES[tone], className)}>{label ?? text}</Badge>
}
