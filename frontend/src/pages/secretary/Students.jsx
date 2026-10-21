import { ArrowLeftRight, KeyRound, Pencil, Plus, Trash2, UserMinus, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router'
import * as studentsApi from '@/api/students.js'
import ConfirmDialog from '@/components/ConfirmDialog.jsx'
import SetPasswordDialog from '@/components/SetPasswordDialog.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PlaceStudentDialog from '@/features/secretary/PlaceStudentDialog.jsx'
import StudentFormDialog from '@/features/secretary/StudentFormDialog.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { LEVELS, initialOf } from '@/lib/format.js'

const TABS = [
  ['all', 'All'],
  ['active', 'Studying'],
  ['waiting', 'Waiting'],
  ['graduated', 'Graduated'],
  ['withdrawn', 'Withdrawn'],
]

// Secretary: every student, with filters and the actions the rules allow.
export default function Students() {
  const { data: students, error, loading, reload } = useLoad(studentsApi.list)
  const [tab, setTab] = useState('all')
  const [level, setLevel] = useState('all')
  const [shift, setShift] = useState('all')
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState(null) // null | { type: 'edit' | 'place' | 'password' | 'withdraw' | 'delete', student }
  const close = () => setDialog(null)
  const run = (action, message) => perform(action, message).then(reload)

  if (error) {
    return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  }

  const all = students ?? []
  const count = (status) => (status === 'all' ? all.length : all.filter((s) => s.status === status).length)
  const shown = all.filter(
    (s) =>
      (tab === 'all' || s.status === tab) &&
      (level === 'all' || s.level === level) &&
      (shift === 'all' || s.class?.shift === shift) &&
      s.full_name.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="h-auto flex-wrap">
            {TABS.map(([value, label]) => (
              <TabsTrigger key={value} value={value}>
                {label} <span className="font-mono text-xs text-muted-foreground">{loading ? '' : count(value)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Button asChild>
          <Link to="/secretary/students/new">
            <Plus aria-hidden="true" />
            New student
          </Link>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input className="w-full sm:w-56" placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search students" />
        <Select value={level} onValueChange={setLevel}>
          <SelectTrigger className="w-32" aria-label="Level"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            {LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={shift} onValueChange={setShift}>
          <SelectTrigger className="w-36" aria-label="Shift"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shifts</SelectItem>
            <SelectItem value="morning">Morning</SelectItem>
            <SelectItem value="evening">Evening</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="py-2">
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-end">Grades</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 5 }, (_, i) => (
                  <TableRow key={i}><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))}

              {!loading && shown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No students match these filters.</TableCell>
                </TableRow>
              )}

              {shown.map((s) => {
                const canPlace = s.status === 'active' || s.status === 'waiting'
                const hasGrades = s.grades_count > 0
                return (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">{initialOf(s.full_name)}</span>
                        <div className="flex flex-col leading-tight">
                          <span className="font-medium">{s.full_name}</span>
                          <span className="font-mono text-xs text-muted-foreground">{s.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary" className="font-mono">{s.level}</Badge></TableCell>
                    <TableCell>{s.class ? <Link className="hover:underline" to={`/secretary/classes/${s.class.id}`}>{s.class.label}</Link> : <span className="text-muted-foreground">—</span>}</TableCell>
                    <TableCell className="text-end font-mono">{s.grades_count || <span className="text-muted-foreground">None</span>}</TableCell>
                    <TableCell><StatusPill value={s.status} /></TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" title="Edit" aria-label={`Edit ${s.full_name}`} onClick={() => setDialog({ type: 'edit', student: s })}>
                          <Pencil aria-hidden="true" />
                        </Button>
                        {canPlace && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            title={s.class ? 'Move to another class' : 'Place in a class'}
                            aria-label={`${s.class ? 'Move' : 'Place'} ${s.full_name}`}
                            onClick={() => setDialog({ type: 'place', student: s })}
                          >
                            {s.class ? <ArrowLeftRight aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon-sm" title="Set password" aria-label={`Set password for ${s.full_name}`} onClick={() => setDialog({ type: 'password', student: s })}>
                          <KeyRound aria-hidden="true" />
                        </Button>
                        {canPlace && (
                          <Button variant="ghost" size="icon-sm" title="Withdraw" aria-label={`Withdraw ${s.full_name}`} onClick={() => setDialog({ type: 'withdraw', student: s })}>
                            <UserMinus aria-hidden="true" />
                          </Button>
                        )}
                        {/* a student with grades can never be deleted (the server answers 409): withdraw them instead */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:text-destructive"
                          disabled={hasGrades}
                          title={hasGrades ? 'Has grades: withdraw instead' : 'Delete'}
                          aria-label={`Delete ${s.full_name}`}
                          onClick={() => setDialog({ type: 'delete', student: s })}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {dialog?.type === 'edit' && (
        <StudentFormDialog
          student={dialog.student}
          onSubmit={(values) => run(() => studentsApi.update(dialog.student.id, values), 'Changes saved')}
          onClose={close}
        />
      )}
      {dialog?.type === 'place' && (
        <PlaceStudentDialog
          student={dialog.student}
          onSubmit={(classId) => run(() => studentsApi.move(dialog.student.id, classId), dialog.student.class ? 'Student moved' : 'Student placed in the class')}
          onClose={close}
        />
      )}
      {dialog?.type === 'password' && (
        <SetPasswordDialog
          name={dialog.student.full_name}
          onSubmit={(password) => perform(() => studentsApi.setPassword(dialog.student.user_id, password), 'Password changed')}
          onClose={close}
        />
      )}
      {dialog?.type === 'withdraw' && (
        <ConfirmDialog
          title={`Withdraw ${dialog.student.full_name}?`}
          description="They leave their class and can no longer log in to study. Their grades are kept."
          confirmLabel="Withdraw"
          onConfirm={() => run(() => studentsApi.update(dialog.student.id, { status: 'withdrawn' }), 'Student withdrawn')}
          onClose={close}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title={`Delete ${dialog.student.full_name}?`}
          description="The student and their account are removed for good."
          onConfirm={() => run(() => studentsApi.remove(dialog.student.id), 'Student deleted')}
          onClose={close}
        />
      )}
    </div>
  )
}
