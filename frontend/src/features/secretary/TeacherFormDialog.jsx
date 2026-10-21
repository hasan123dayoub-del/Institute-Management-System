import { useState } from 'react'
import Field from '@/components/Field.jsx'
import PasswordField from '@/components/PasswordField.jsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toDateInput } from '@/lib/format.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(v, editing) {
  const errors = {}
  if (v.full_name.trim().length < 3) errors.full_name = 'Enter the full name (3+ characters)'
  if (!EMAIL.test(v.email)) errors.email = 'Enter a valid email'
  if (!v.hire_date) errors.hire_date = 'Choose the hire date'
  if (v.salary === '' || Number(v.salary) < 0 || Number.isNaN(Number(v.salary))) errors.salary = 'Enter the monthly salary'
  if (!editing && v.password.length < 8) errors.password = 'At least 8 characters'
  return errors
}

// One dialog to add a teacher or edit one. Pass `teacher` to edit.
// onSubmit(values) must return a promise: it rejects when the server says no.
export default function TeacherFormDialog({ teacher, onSubmit, onClose }) {
  const editing = Boolean(teacher)
  const [values, setValues] = useState({
    full_name: teacher?.full_name ?? '',
    email: teacher?.email ?? '',
    phone: teacher?.phone ?? '',
    qualification: teacher?.qualification ?? '',
    hire_date: toDateInput(teacher?.hire_date) || new Date().toISOString().slice(0, 10),
    salary: teacher?.salary ?? '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values, editing)
    setErrors(found)
    if (Object.keys(found).length > 0) return
    setBusy(true)
    try {
      await onSubmit({ ...values, salary: Number(values.salary) })
      onClose()
    } catch {
      // the error toast was already shown: keep the dialog open
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit teacher' : 'Add teacher'}</DialogTitle>
            <DialogDescription>
              {editing ? 'The password is changed separately.' : 'They will log in with this email and password.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" value={values.full_name} onChange={set('full_name')} error={errors.full_name} className="sm:col-span-2" />
            <Field label="Email (used to log in)" type="email" value={values.email} onChange={set('email')} error={errors.email} />
            <Field label="Phone" value={values.phone} onChange={set('phone')} />
            <Field label="Qualification" value={values.qualification} onChange={set('qualification')} hint="CELTA, DELTA, BA English..." />
            <Field label="Hire date" type="date" value={values.hire_date} onChange={set('hire_date')} error={errors.hire_date} />
            <Field label="Monthly salary (SYP)" type="number" min="0" value={values.salary} onChange={set('salary')} error={errors.salary} />
            {!editing && (
              <PasswordField value={values.password} onChange={(password) => setValues((v) => ({ ...v, password }))} error={errors.password} />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create teacher account'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
