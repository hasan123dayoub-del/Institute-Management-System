import { CalendarPlus, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import * as classesApi from '@/api/classes.js'
import * as schedulesApi from '@/api/schedules.js'
import ConfirmDialog from '@/components/ConfirmDialog.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import SessionDialog from '@/features/teacher/SessionDialog.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { DAYS, DAY_LABEL, classLabel, formatDate } from '@/lib/format.js'
import { cn } from '@/lib/utils'

// Defined outside the component so useLoad sees the same function on every render.
const loadSchedule = () =>
  Promise.all([schedulesApi.list(), classesApi.mine()]).then(([sessions, classes]) => ({ sessions, classes }))

// Teacher: the weekly timetable of their own classes. Move, add or delete a session.
export default function Schedule() {
  const { data, error, loading, reload } = useLoad(loadSchedule)
  const [dialog, setDialog] = useState(null) // null | { type: 'add' } | { type: 'move' | 'delete', session }
  const close = () => setDialog(null)

  if (error) {
    return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  }
  if (loading) return <Skeleton className="h-96 w-full" />

  const { sessions, classes } = data
  const editable = classes.filter((c) => c.status !== 'finished')

  // After every change the server answers with the recomputed end date of that course: tell the teacher.
  const endMessage = (verb, result) =>
    result?.course_end_date ? `${verb}. The course now ends on ${formatDate(result.course_end_date)}` : verb

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{sessions.length} sessions a week across {classes.length} classes</p>
        <Button onClick={() => setDialog({ type: 'add' })} disabled={editable.length === 0}>
          <CalendarPlus aria-hidden="true" />
          Add session
        </Button>
      </div>

      {/* One column per day. Click a session to move or delete it. */}
      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {DAYS.map((day) => {
          const todays = sessions.filter((s) => s.day === day).sort((a, b) => a.start_time.localeCompare(b.start_time))
          return (
            <section key={day} className="flex flex-col gap-2" aria-label={DAY_LABEL[day]}>
              <h3 className="text-sm font-medium text-muted-foreground">{DAY_LABEL[day]}</h3>
              {todays.length === 0 && <div className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">Free</div>}
              {todays.map((s) => {
                const done = s.class.status === 'finished'
                return (
                  <Card key={s.id} className={cn('gap-1 py-3', done && 'opacity-60')}>
                    <CardContent className="flex flex-col gap-1 px-3 text-sm">
                      <span className="font-medium">{classLabel(s.class)}</span>
                      <span className="font-mono text-xs">{s.start_time}–{s.end_time}</span>
                      <span className="flex items-center justify-between gap-1">
                        <span className="font-mono text-xs text-muted-foreground">{s.class.room}</span>
                        {done ? (
                          <StatusPill value="finished" />
                        ) : (
                          <span className="flex">
                            <Button variant="ghost" size="icon-xs" title="Move" aria-label={`Move ${classLabel(s.class)} on ${DAY_LABEL[day]}`} onClick={() => setDialog({ type: 'move', session: s })}>
                              <Pencil aria-hidden="true" />
                            </Button>
                            <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive" title="Delete" aria-label={`Delete ${classLabel(s.class)} on ${DAY_LABEL[day]}`} onClick={() => setDialog({ type: 'delete', session: s })}>
                              <Trash2 aria-hidden="true" />
                            </Button>
                          </span>
                        )}
                      </span>
                    </CardContent>
                  </Card>
                )
              })}
            </section>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course end dates</CardTitle>
          <CardDescription>Computed from the timetable. Moving or deleting a session changes them.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {classes.map((c) => (
              <li key={c.id} className="flex items-center justify-between gap-2 border-b border-dashed pb-2">
                <span>{classLabel(c)} <StatusPill value={c.status} /></span>
                <span className="font-mono text-xs text-muted-foreground">
                  {c.schedule.length === 0 ? 'No sessions yet' : `ends ${formatDate(c.last_session_date)}`}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {dialog?.type === 'add' && (
        <SessionDialog
          classes={editable}
          onSubmit={(v) =>
            perform(() => schedulesApi.add(v)).then((r) => {
              toast.success(endMessage('Session added', r))
              reload()
            })
          }
          onClose={close}
        />
      )}
      {dialog?.type === 'move' && (
        <SessionDialog
          session={dialog.session}
          classes={editable}
          onSubmit={(v) =>
            perform(() => schedulesApi.move(dialog.session.id, { day: v.day, start_time: v.start_time, end_time: v.end_time })).then((r) => {
              toast.success(endMessage('Session moved', r))
              reload()
            })
          }
          onClose={close}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title="Delete this session?"
          description={`${classLabel(dialog.session.class)} on ${DAY_LABEL[dialog.session.day]}, ${dialog.session.start_time}–${dialog.session.end_time}. The course end date will move later.`}
          onConfirm={() =>
            perform(() => schedulesApi.remove(dialog.session.id)).then((r) => {
              toast.success(endMessage('Session deleted', r))
              reload()
            })
          }
          onClose={close}
        />
      )}
    </div>
  )
}
