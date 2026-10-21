import { Check } from 'lucide-react'
import * as studentsApi from '@/api/students.js'
import Progress from '@/components/Progress.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoad } from '@/hooks/useLoad.js'
import { EXAMS, LEVELS, classLabel, formatDate } from '@/lib/format.js'
import { nextSession } from '@/lib/schedule.js'
import { cn } from '@/lib/utils'

// The newest grade the student has (final, then midterm, then oral)
const latestGrade = (grades) => ['final', 'midterm', 'oral'].find((exam) => grades[exam] !== undefined && grades[exam] !== null)

// Student: read only. Their class, how far the course went, their level and their grades.
export default function Portal() {
  const { data: me, error, loading } = useLoad(studentsApi.me)

  if (error) return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  if (loading) return <Skeleton className="h-96 w-full" />

  const cls = me.class
  const next = cls && nextSession(cls.schedule)
  const latest = latestGrade(me.grades)
  const levelIndex = LEVELS.indexOf(me.level)
  const graduated = me.status === 'graduated'

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 md:grid-cols-4">
        {/* next session */}
        <Card className="gap-2 bg-brand-deep py-4 text-white md:col-span-2">
          <CardHeader className="gap-1">
            <CardDescription className="text-white/70">
              {next ? `Next session · ${next.date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}` : 'Next session'}
            </CardDescription>
            <CardTitle className="font-display text-xl">{cls ? classLabel(cls) : 'Waiting for a class'}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-white/85">
            {cls && next && <>{cls.teacher_name} · Room <span className="font-mono">{cls.room}</span> · <span className="font-mono">{next.start_time}–{next.end_time}</span></>}
            {cls && !next && 'No sessions in the timetable yet.'}
            {!cls && 'The front desk will place you in a class at your level soon.'}
          </CardContent>
        </Card>

        {/* progress */}
        <Card className="gap-2 py-4">
          <CardHeader className="gap-1">
            <CardDescription>Course progress</CardDescription>
            <CardTitle className="font-mono text-2xl font-medium">{cls ? `${cls.sessions_done}/${cls.total_sessions}` : '—'}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {cls && <Progress value={cls.sessions_done} max={cls.total_sessions} label="Course progress" />}
            <small className="text-muted-foreground">{cls ? `ends ${formatDate(cls.course_end_date)}` : 'no course yet'}</small>
          </CardContent>
        </Card>

        {/* latest grade */}
        <Card className="gap-2 py-4">
          <CardHeader className="gap-1">
            <CardDescription>Latest grade</CardDescription>
            <CardTitle className="font-mono text-2xl font-medium">{latest ? `${me.grades[latest]}/${EXAMS[latest].max}` : '—'}</CardTitle>
          </CardHeader>
          <CardContent><small className="text-muted-foreground">{latest ? `${EXAMS[latest].label.toLowerCase()} exam` : 'no grades yet'}</small></CardContent>
        </Card>
      </div>

      {/* the six levels */}
      <Card>
        <CardHeader><CardTitle>My path through the levels</CardTitle></CardHeader>
        <CardContent>
          <ol className="grid grid-cols-6 gap-1.5">
            {LEVELS.map((code, i) => {
              const done = graduated || i < levelIndex
              const current = !graduated && i === levelIndex
              return (
                <li
                  key={code}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'flex items-center justify-center gap-1 rounded-md py-1.5 font-mono text-xs sm:text-sm',
                    current ? 'bg-primary font-bold text-primary-foreground' : done ? 'bg-accent text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {code}
                  {done && <Check className="size-3" aria-label="completed" />}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>My {me.level} grades</CardTitle>
            <CardDescription>Out of 100 in total. You pass with 60 or more.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm">
              {Object.entries(EXAMS).map(([key, { label, max }]) => {
                const value = me.grades[key]
                return (
                  <li key={key} className="flex items-center justify-between gap-2 border-b border-dashed pb-2">
                    <span>{label}</span>
                    {value === undefined || value === null ? (
                      <span className="text-muted-foreground">
                        {key === 'final' && cls ? `at the last session, ${formatDate(cls.course_end_date)}` : 'not graded yet'}
                      </span>
                    ) : (
                      <b className="font-mono">{value}/{max}</b>
                    )}
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>My account</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="flex items-center gap-2"><StatusPill value={me.status} /></p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="text-muted-foreground">Email</dt><dd className="break-all font-mono text-xs">{me.email}</dd>
              <dt className="text-muted-foreground">Phone</dt><dd className="font-mono text-xs">{me.phone}</dd>
            </dl>
            <small className="text-muted-foreground">To change your password, ask the front desk.</small>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
