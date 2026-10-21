import { useState } from 'react'
import { Link } from 'react-router'
import * as teachersApi from '@/api/teachers.js'
import Field from '@/components/Field.jsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useLoad } from '@/hooks/useLoad.js'
import { LEVELS, toDateInput } from '@/lib/format.js'

// Add a class or edit one (pass `cls` to edit). When editing, the level, shift and start date are fixed:
// they identify the class. Teachers come from the real /teachers endpoint.
// onSubmit(values) must return a promise.
export default function ClassFormDialog({ cls, onSubmit, onClose }) {
  const editing = Boolean(cls)
  const { data: teachers, loading } = useLoad(teachersApi.list)
  const [values, setValues] = useState({
    level: cls?.level ?? 'A1',
    shift: cls?.shift ?? 'morning',
    teacher_id: cls?.teacher.id ?? '',
    room: cls?.room ?? '',
    capacity: cls?.capacity ?? 20,
    start_date: toDateInput(cls?.start_date),
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))
  const pick = (field) => (value) => setValues((v) => ({ ...v, [field]: value }))

  const activeTeachers = (teachers ?? []).filter((t) => t.is_active || t.id === cls?.teacher.id)

  const submit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.teacher_id) found.teacher_id = 'Choose the teacher'
    if (!editing && !values.start_date) found.start_date = 'Choose the start date'
    if (!(Number(values.capacity) >= 1)) found.capacity = 'At least 1 seat'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setBusy(true)
    try {
      await onSubmit({ ...values, capacity: Number(values.capacity) })
      onClose()
    } catch {
      // toast already shown (for example: a class for this level and shift already starts that day)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit class' : 'New class'}</DialogTitle>
            <DialogDescription>
              {editing ? 'The level, shift and start date cannot change.' : 'One morning and one evening class per level and term.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Level</Label>
              <Select value={values.level} onValueChange={pick('level')} disabled={editing}>
                <SelectTrigger className="w-full" aria-label="Level"><SelectValue /></SelectTrigger>
                <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Shift</Label>
              <Select value={values.shift} onValueChange={pick('shift')} disabled={editing}>
                <SelectTrigger className="w-full" aria-label="Shift"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Teacher</Label>
              <Select value={values.teacher_id} onValueChange={pick('teacher_id')} disabled={loading || activeTeachers.length === 0}>
                <SelectTrigger className="w-full" aria-label="Teacher" aria-invalid={errors.teacher_id ? true : undefined}>
                  <SelectValue placeholder={loading ? 'Loading…' : 'Choose a teacher'} />
                </SelectTrigger>
                <SelectContent>
                  {activeTeachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
              {!loading && activeTeachers.length === 0 && (
                <span className="text-xs text-muted-foreground">
                  There are no teachers yet. <Link className="text-primary underline" to="/secretary/teachers" onClick={onClose}>Add a teacher first</Link>.
                </span>
              )}
              {errors.teacher_id && <span className="text-xs text-destructive" role="alert">{errors.teacher_id}</span>}
            </div>

            <Field label="Room" value={values.room} onChange={set('room')} />
            <Field label="Seats" type="number" min="1" value={values.capacity} onChange={set('capacity')} error={errors.capacity} />
            <Field label="Start date" type="date" value={values.start_date} onChange={set('start_date')} error={errors.start_date} disabled={editing} className="sm:col-span-2" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create class'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
