import { useState } from 'react'
import Field from '@/components/Field.jsx'
import PasswordField from '@/components/PasswordField.jsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Returns { fieldName: "message" } for every field that is wrong (empty object = all good).
function validate(values, editing) {
  const errors = {}
  if (values.full_name.trim().length < 3) errors.full_name = 'Enter the full name (3+ characters)'
  if (!EMAIL.test(values.email)) errors.email = 'Enter a valid email'
  if (!editing && values.password.length < 8) errors.password = 'At least 8 characters'
  return errors
}

// One dialog for both "add" and "edit". Pass `secretary` to edit, or nothing to add.
// onSubmit(values) must return a promise: it rejects when the server says no.
export default function SecretaryFormDialog({ secretary, onSubmit, onClose }) {
  const editing = Boolean(secretary)
  const [values, setValues] = useState({
    full_name: secretary?.full_name ?? '',
    email: secretary?.email ?? '',
    phone: secretary?.phone ?? '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)

  // set('email') returns the onChange handler for the email field
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    const found = validate(values, editing)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setBusy(true)
    try {
      await onSubmit(values)
      onClose()
    } catch {
      // the error toast was already shown; keep the dialog open so the admin can fix it
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit secretary' : 'Add secretary'}</DialogTitle>
            <DialogDescription>
              {editing ? 'Change the details. The password is changed separately.' : 'She will log in with this email and password.'}
            </DialogDescription>
          </DialogHeader>

          <Field label="Full name" value={values.full_name} onChange={set('full_name')} error={errors.full_name} />
          <Field label="Email (used to log in)" type="email" value={values.email} onChange={set('email')} error={errors.email} />
          <Field label="Phone" value={values.phone} onChange={set('phone')} />
          {!editing && (
            <PasswordField
              value={values.password}
              onChange={(password) => setValues((v) => ({ ...v, password }))}
              error={errors.password}
            />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add secretary'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
