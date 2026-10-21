import { ArrowLeft, ArrowLeftRight, Pencil, Play, Plus, Trash2 } from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import * as classesApi from '@/api/classes.js'
import * as studentsApi from '@/api/students.js'
import ConfirmDialog from '@/components/ConfirmDialog.jsx'
import Progress from '@/components/Progress.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AddStudentDialog from '@/features/secretary/AddStudentDialog.jsx'
import ClassFormDialog from '@/features/secretary/ClassFormDialog.jsx'
import PlaceStudentDialog from '@/features/secretary/PlaceStudentDialog.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { DAY_LABEL, EXAMS, STUDENT_STATUS_LABEL, classLabel, formatDate, initialOf } from '@/lib/format.js'
import { cn } from '@/lib/utils'

const total = (g) => (g.oral ?? 0) + (g.midterm ?? 0) + (g.final ?? 0)
const mark = (value, exam) => (value === undefined || value === null ? '—' : `${value}`) + (value === undefined || value === null ? '' : `/${EXAMS[exam].max}`)

// Secretary: one class, its course status, and its students with their grades.
export default function ClassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const load = useCallback(
    () => Promise.all([classesApi.get(id), classesApi.students(id)]).then(([cls, students]) => ({ cls, students })),
    [id],
  )
  const { data, error, loading, reload } = useLoad(load)
  const [dialog, setDialog] = useState(null) // null | { type: 'edit' | 'start' | 'delete' | 'add' | 'move' | 'removeStudent', student? }
  const close = () => setDialog(null)
  const run = (action, message) => perform(action, message).then(reload)

  if (error) {
    return (
      <div className="flex flex-col items-start gap-3">
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
        <Button asChild variant="outline"><Link to="/secretary/classes"><ArrowLeft aria-hidden="true" />Back to classes</Link></Button>
      </div>
    )
  }
  if (loading) return <Skeleton className="h-96 w-full" />

  const { cls, students } = data
  const finished = cls.status === 'finished'
  const timetable = cls.schedule.length
    ? `${[...new Set(cls.schedule.map((s) => DAY_LABEL[s.day].slice(0, 3)))].join(' · ')}  ${cls.schedule[0].start_time}–${cls.schedule[0].end_time}`
    : 'Not set yet (the teacher builds it)'
  const passed = students.filter((s) => total(s.grades) >= 60).length
  const STEPS = [['open', 'Open'], ['running', 'Running'], ['finished', 'Finished']]
  const stepIndex = STEPS.findIndex(([key]) => key === cls.status)

  return (
    <div className="flex flex-col gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link to="/secretary/classes"><ArrowLeft aria-hidden="true" />All classes</Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="font-display text-2xl">{classLabel(cls)}</CardTitle>
              <StatusPill value={cls.shift} />
              <StatusPill value={cls.status} />
              {finished && <Badge variant="outline">Read only</Badge>}
            </div>
            {!finished && (
              <div className="col-start-2 row-span-2 flex flex-wrap justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => setDialog({ type: 'edit' })}><Pencil aria-hidden="true" />Edit class</Button>
                {cls.status === 'open' && <Button size="sm" onClick={() => setDialog({ type: 'start' })}><Play aria-hidden="true" />Start course</Button>}
                {cls.status === 'open' && students.length === 0 && (
                  <Button variant="outline" size="sm" className="text-destructive" onClick={() => setDialog({ type: 'delete' })}><Trash2 aria-hidden="true" />Delete</Button>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Teacher</dt><dd>{cls.teacher.full_name}</dd>
              <dt className="text-muted-foreground">Room</dt><dd className="font-mono">{cls.room || '—'}</dd>
              <dt className="text-muted-foreground">Timetable</dt><dd className="font-mono">{timetable}</dd>
              <dt className="text-muted-foreground">{cls.status === 'open' ? 'Starts' : 'Started'}</dt><dd className="font-mono">{formatDate(cls.start_date)}</dd>
              <dt className="text-muted-foreground">Seats</dt><dd className="font-mono">{cls.students_count} / {cls.capacity}</dd>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Course status</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <ol className="flex flex-wrap items-center gap-1.5">
              {STEPS.map(([key, label], i) => (
                <li key={key} className="flex items-center gap-1.5">
                  <Badge variant={i === stepIndex ? 'default' : 'secondary'} className={cn(i < stepIndex && 'bg-accent text-primary')}>
                    {i < stepIndex ? `${label} ✓` : label}
                  </Badge>
                  {i < STEPS.length - 1 && <span aria-hidden="true" className="text-muted-foreground">→</span>}
                </li>
              ))}
            </ol>
            <div>
              <p className="text-muted-foreground">Sessions so far <b className="font-mono text-foreground">{cls.sessions_done} / {cls.total_sessions}</b></p>
              <Progress value={cls.sessions_done} max={cls.total_sessions} label="Sessions held" className="mt-1" />
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
              <dt className="text-muted-foreground">Last session</dt><dd className="font-mono">{formatDate(cls.last_session_date)}</dd>
              <dt className="text-muted-foreground">{finished ? 'Closed' : 'Closes itself'}</dt><dd className="font-mono">{formatDate(cls.closes_on)}</dd>
            </dl>
            <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
              There is no finish button. Three days after the last session the system closes the course and moves the students on according to their results.
            </p>
          </CardContent>
        </Card>
      </div>

      {finished && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="gap-1 py-4"><CardHeader><CardDescription>Students</CardDescription><CardTitle className="font-mono text-2xl">{students.length}</CardTitle></CardHeader></Card>
          <Card className="gap-1 py-4"><CardHeader><CardDescription>Passed (now waiting at the next level)</CardDescription><CardTitle className="font-mono text-2xl text-success">{passed}</CardTitle></CardHeader></Card>
          <Card className="gap-1 py-4"><CardHeader><CardDescription>Failed (waiting at the same level)</CardDescription><CardTitle className="font-mono text-2xl text-destructive">{students.length - passed}</CardTitle></CardHeader></Card>
        </div>
      )}

      <Card className="py-3">
        <CardHeader className="flex-row items-center justify-between gap-2">
          <CardTitle>Students in this class <span className="font-mono text-sm font-normal text-muted-foreground">{students.length} / {cls.capacity}</span></CardTitle>
          {!finished && (
            <Button size="sm" onClick={() => setDialog({ type: 'add' })} disabled={cls.students_count >= cls.capacity}>
              <Plus aria-hidden="true" />Add student to class
            </Button>
          )}
        </CardHeader>
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-end">Oral /20</TableHead>
                <TableHead className="text-end">Midterm /30</TableHead>
                <TableHead className="text-end">Final /50</TableHead>
                {finished ? (
                  <>
                    <TableHead className="text-end">Total</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Now</TableHead>
                  </>
                ) : (
                  <TableHead className="text-end">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 && (
                <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No students in this class.</TableCell></TableRow>
              )}
              {students.map((s) => {
                const sum = total(s.grades)
                const noGrades = s.grades_count === 0
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">{initialOf(s.full_name)}</span>
                        <span className="font-medium">{s.full_name}</span>
                        {!finished && noGrades && <Badge variant="outline">New</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{s.phone}</TableCell>
                    {['oral', 'midterm', 'final'].map((exam) => (
                      <TableCell key={exam} className="text-end font-mono">{mark(s.grades[exam], exam)}</TableCell>
                    ))}
                    {finished ? (
                      <>
                        <TableCell className="text-end font-mono font-bold">{sum}</TableCell>
                        <TableCell>
                          <StatusPill value={sum >= 60 ? 'passed' : 'failed'} label={sum >= 60 ? 'Passed' : s.grades.final === undefined ? 'No final grade' : 'Failed'} />
                        </TableCell>
                        <TableCell><StatusPill value={s.status} label={`${STUDENT_STATUS_LABEL[s.status] ?? s.status} · ${s.level}`} /></TableCell>
                      </>
                    ) : (
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" title="Move to another class" aria-label={`Move ${s.full_name}`} onClick={() => setDialog({ type: 'move', student: s })}>
                            <ArrowLeftRight aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            disabled={!noGrades}
                            title={noGrades ? 'Delete' : 'Has grades: withdraw from the students page instead'}
                            aria-label={`Delete ${s.full_name}`}
                            onClick={() => setDialog({ type: 'removeStudent', student: s })}
                          >
                            <Trash2 aria-hidden="true" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {dialog?.type === 'edit' && (
        <ClassFormDialog cls={cls} onSubmit={(v) => run(() => classesApi.update(cls.id, { teacher_id: v.teacher_id, room: v.room, capacity: v.capacity }), 'Changes saved')} onClose={close} />
      )}
      {dialog?.type === 'start' && (
        <ConfirmDialog
          title={`Start ${classLabel(cls)}?`}
          description="The course begins. It will close by itself 3 days after its last session."
          confirmLabel="Start course"
          destructive={false}
          onConfirm={() => run(() => classesApi.start(cls.id), 'Course started')}
          onClose={close}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title={`Delete ${classLabel(cls)}?`}
          description="Only an open class with no students can be deleted. Its timetable is deleted with it."
          onConfirm={() => perform(() => classesApi.remove(cls.id), 'Class deleted').then(() => navigate('/secretary/classes'))}
          onClose={close}
        />
      )}
      {dialog?.type === 'add' && (
        <AddStudentDialog cls={cls} onSubmit={(studentId) => run(() => studentsApi.move(studentId, cls.id), 'Student added to the class')} onClose={close} />
      )}
      {dialog?.type === 'move' && (
        <PlaceStudentDialog
          student={{ ...dialog.student, class: { id: cls.id, label: classLabel(cls) } }}
          onSubmit={(classId) => run(() => studentsApi.move(dialog.student.id, classId), 'Student moved')}
          onClose={close}
        />
      )}
      {dialog?.type === 'removeStudent' && (
        <ConfirmDialog
          title={`Delete ${dialog.student.full_name}?`}
          description="The student has no grades, so the student and their account are removed for good."
          onConfirm={() => run(() => studentsApi.remove(dialog.student.id), 'Student deleted')}
          onClose={close}
        />
      )}
    </div>
  )
}
