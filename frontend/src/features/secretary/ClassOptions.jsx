import StatusPill from '@/components/StatusPill.jsx'
import { cn } from '@/lib/utils'
import { classLabel } from '@/lib/format.js'

// A list of classes to pick from (one choice only). Used when registering a student and when moving one.
//   classes   the classes to show      value     the selected class id (or null)
//   onChange(id)                       allowNone adds a "no class yet" choice (waiting list)
export default function ClassOptions({ classes, value, onChange, allowNone = false, emptyText = 'No class available' }) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {classes.map((c) => {
        const full = c.students_count >= c.capacity
        const selected = value === c.id
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={full}
            onClick={() => onChange(c.id)}
            className={cn(
              'flex items-center gap-3 rounded-md border px-3 py-2 text-start text-sm transition-colors',
              selected ? 'border-primary bg-accent' : 'hover:bg-muted',
              full && 'cursor-not-allowed opacity-50',
            )}
          >
            <span
              aria-hidden="true"
              className={cn('size-3 shrink-0 rounded-full border-2', selected ? 'border-primary bg-primary' : 'border-muted-foreground')}
            />
            <span className="flex-1">
              {classLabel(c)} <span className="text-muted-foreground">· {c.teacher.full_name}</span>
            </span>
            <StatusPill value={c.status} />
            <span className="font-mono text-xs text-muted-foreground">{full ? 'Full' : `${c.students_count}/${c.capacity}`}</span>
          </button>
        )
      })}

      {allowNone && (
        <button
          type="button"
          role="radio"
          aria-checked={value === null}
          onClick={() => onChange(null)}
          className={cn('flex items-center gap-3 rounded-md border px-3 py-2 text-start text-sm transition-colors', value === null ? 'border-primary bg-accent' : 'hover:bg-muted')}
        >
          <span aria-hidden="true" className={cn('size-3 shrink-0 rounded-full border-2', value === null ? 'border-primary bg-primary' : 'border-muted-foreground')} />
          No class yet, add to the waiting list
        </button>
      )}

      {classes.length === 0 && !allowNone && <p className="text-sm text-muted-foreground">{emptyText}</p>}
      {classes.length === 0 && allowNone && <p className="text-xs text-muted-foreground">{emptyText}</p>}
    </div>
  )
}
