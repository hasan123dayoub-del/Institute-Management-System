import { Lock } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import * as gradesApi from '@/api/grades.js'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { EXAMS, formatDate, initialOf } from '@/lib/format.js'

const today = () => new Date().toISOString().slice(0, 10)

// The grade sheet of ONE class. The parent gives it key={classId}, so it starts fresh for every class.
// Rules (the server applies the same ones): the final opens on the last session day, and everything
// closes 3 days after it (or when the course is finished). A student without a final grade does not pass.
export default function ClassGrades({ classId }) {
  const load = useCallback(() => gradesApi.forClass(classId), [classId])
  const { data, error, loading, reload } = useLoad(load)
  const [exam, setExam] = useState('oral')
  const [edits, setEdits] = useState({}) // { [exam]: { [studentId]: "17" } }: what the teacher typed and did not save yet
  const [errors, setErrors] = useState({}) // { [studentId]: "message" }
  const [busy, setBusy] = useState(false)

  if (error) return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  if (loading) return <Skeleton className="h-64 w-full" />

  const { students, grades, course_end_date, grading_deadline, class_status } = data
  const { max } = EXAMS[exam]

  const closed = class_status === 'finished' || (grading_deadline && today() > grading_deadline)
  const finalNotOpen = exam === 'final' && (!course_end_date || today() < course_end_date)
  const locked = closed || finalNotOpen

  const valueOf = (studentId) => edits[exam]?.[studentId] ?? grades[studentId]?.[exam] ?? ''
  const change = (studentId, value) => {
    setEdits((e) => ({ ...e, [exam]: { ...e[exam], [studentId]: value } }))
    setErrors((e) => ({ ...e, [studentId]: undefined }))
  }

  const save = async () => {
    // only the cells the teacher typed in this exam
    const typed = Object.entries(edits[exam] ?? {}).filter(([, v]) => v !== '')
    if (typed.length === 0) return toast.info('Nothing to save yet')

    const found = {}
    for (const [studentId, v] of typed) {
      if (!Number.isFinite(Number(v)) || Number(v) < 0 || Number(v) > max) found[studentId] = `0 to ${max}`
    }
    setErrors(found)
    if (Object.keys(found).length > 0) return toast.error(`${EXAMS[exam].label} grades must be between 0 and ${max}`)

    setBusy(true)
    try {
      await perform(
        () => gradesApi.save(classId, exam, typed.map(([student_id, v]) => ({ student_id, score: Number(v) }))),
        `${EXAMS[exam].label} grades saved`,
      )
      // keep what was typed: it equals what the server now has, so the cells do not blink empty while the list reloads
      reload()
    } catch {
      // the server said no (window closed, final not open yet...): the toast explains
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={exam} onValueChange={setExam}>
          <TabsList>
            {Object.entries(EXAMS).map(([key, { label, max: m }]) => (
              <TabsTrigger key={key} value={key}>
                {label} /{m}
                {key === 'final' && (closed || !course_end_date || today() < course_end_date) && <Lock className="size-3" aria-label="locked" />}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button onClick={save} disabled={busy || locked || students.length === 0}>{busy ? 'Saving…' : 'Save grades'}</Button>
      </div>

      <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
        {class_status === 'finished'
          ? 'This course is finished: the grades are locked. The results are on the secretary’s class page.'
          : !course_end_date
            ? 'This class has no timetable yet, so the final cannot open.'
            : closed
              ? `The grading window closed on ${formatDate(grading_deadline)}.`
              : `The final opens on ${formatDate(course_end_date)} (the last session) and must be entered before ${formatDate(grading_deadline)}. A student with no final grade does not pass.`}
      </p>

      <Card className="py-2">
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                {Object.entries(EXAMS).map(([key, { label, max: m }]) => (
                  <TableHead key={key} className={key === exam ? 'text-foreground' : ''}>{label} /{m}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 && (
                <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No active students in this class.</TableCell></TableRow>
              )}
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">{initialOf(s.full_name)}</span>
                      {s.full_name}
                    </div>
                  </TableCell>
                  {Object.keys(EXAMS).map((key) =>
                    key === exam ? (
                      <TableCell key={key}>
                        {locked ? (
                          <span className="font-mono">{grades[s.id]?.[key] ?? '—'}</span>
                        ) : (
                          <Input
                            type="number"
                            min="0"
                            max={max}
                            inputMode="numeric"
                            className="h-8 w-20 font-mono"
                            value={valueOf(s.id)}
                            aria-label={`${EXAMS[exam].label} grade for ${s.full_name}`}
                            aria-invalid={errors[s.id] ? true : undefined}
                            title={errors[s.id]}
                            onChange={(e) => change(s.id, e.target.value)}
                          />
                        )}
                      </TableCell>
                    ) : (
                      <TableCell key={key} className="font-mono text-muted-foreground">{grades[s.id]?.[key] ?? '—'}</TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
