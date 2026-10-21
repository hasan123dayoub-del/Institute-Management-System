import { Progress as UiProgress } from '@/components/ui/progress'

// <Progress value={18} max={30} /> -> bar at 60%. (shadcn's own Progress takes a 0-100 value.)
export default function Progress({ value, max, label, className }) {
  const pct = max ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <UiProgress
      value={pct}
      className={className}
      aria-label={label}
      aria-valuetext={`${value} of ${max}`}
    />
  )
}
