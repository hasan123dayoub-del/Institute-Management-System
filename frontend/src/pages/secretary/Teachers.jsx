import { KeyRound, Pencil, Plus, Power } from 'lucide-react'
import { useState } from 'react'
import * as teachersApi from '@/api/teachers.js'
import * as usersApi from '@/api/users.js'
import SetPasswordDialog from '@/components/SetPasswordDialog.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import TeacherFormDialog from '@/features/secretary/TeacherFormDialog.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { formatMoney, initialOf, shiftLabel } from '@/lib/format.js'

// Secretary: teachers and their salaries. Talks to the real backend (/teachers, /teachers/:id/pay).
export default function Teachers() {
  const { data: teachers, error, loading, reload } = useLoad(teachersApi.list)
  const [dialog, setDialog] = useState(null) // null | { type: 'create' | 'edit' | 'password', teacher }
  const close = () => setDialog(null)
  const run = (action, message) => perform(action, message).then(reload)

  if (error) {
    return <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">{error}</p>
  }

  const paid = teachers?.filter((t) => t.salary_status === 'paid').length ?? 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading…' : `${teachers.length} teachers · ${paid} of ${teachers.length} paid this month`}
        </p>
        <Button onClick={() => setDialog({ type: 'create' })}>
          <Plus aria-hidden="true" />
          Add teacher
        </Button>
      </div>

      <Card className="py-2">
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Classes</TableHead>
                <TableHead className="text-end">Salary (SYP)</TableHead>
                <TableHead>Salary status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                ))}

              {teachers?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No teachers yet. Add the first one: classes need a teacher.
                  </TableCell>
                </TableRow>
              )}

              {teachers?.map((t) => (
                <TableRow key={t.id} className={t.is_active ? '' : 'opacity-60'}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                        {initialOf(t.full_name)}
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">
                          {t.full_name} {!t.is_active && <Badge variant="outline">Inactive</Badge>}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">{t.qualification || t.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {t.classes.length === 0 && <span className="text-muted-foreground">—</span>}
                      {t.classes.map((c) => (
                        <Badge key={c.id} variant="secondary" className="font-mono">
                          {c.level} {shiftLabel(c.shift)[0]}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-end font-mono tabular-nums">{formatMoney(t.salary)}</TableCell>
                  <TableCell><StatusPill value={t.salary_status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* paid already -> disabled until the 1st of next month (the server also answers 409) */}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={t.salary_status === 'paid'}
                        onClick={() => run(() => teachersApi.pay(t.id), `${t.full_name} marked as paid`).catch(() => {})}
                      >
                        Mark as paid
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Edit" aria-label={`Edit ${t.full_name}`} onClick={() => setDialog({ type: 'edit', teacher: t })}>
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Set password" aria-label={`Set password for ${t.full_name}`} onClick={() => setDialog({ type: 'password', teacher: t })}>
                        <KeyRound aria-hidden="true" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={t.is_active ? 'Deactivate' : 'Activate'}
                        aria-label={`${t.is_active ? 'Deactivate' : 'Activate'} ${t.full_name}`}
                        onClick={() =>
                          run(() => teachersApi.update(t.id, { is_active: !t.is_active }), t.is_active ? 'Account deactivated' : 'Account activated').catch(() => {})
                        }
                      >
                        <Power aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {dialog?.type === 'create' && (
        <TeacherFormDialog
          onSubmit={({ full_name, email, password, phone, qualification, hire_date, salary }) =>
            run(() => teachersApi.create({ full_name, email, password, phone, qualification, hire_date, salary }), 'Teacher added')
          }
          onClose={close}
        />
      )}
      {dialog?.type === 'edit' && (
        <TeacherFormDialog
          teacher={dialog.teacher}
          onSubmit={({ full_name, email, phone, qualification, hire_date, salary }) =>
            run(() => teachersApi.update(dialog.teacher.id, { full_name, email, phone, qualification, hire_date, salary }), 'Changes saved')
          }
          onClose={close}
        />
      )}
      {dialog?.type === 'password' && (
        // the password route needs the USER id of the teacher (user_id), not the teacher id
        <SetPasswordDialog
          name={dialog.teacher.full_name}
          onSubmit={(password) => perform(() => usersApi.setPassword(dialog.teacher.user_id, password), 'Password changed')}
          onClose={close}
        />
      )}
    </div>
  )
}
