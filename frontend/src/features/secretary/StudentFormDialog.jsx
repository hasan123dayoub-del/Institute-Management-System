import { useState } from 'react'
import Field from '@/components/Field.jsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toDateInput } from '@/lib/format.js'

// Edit a student's personal details. The email (their login) and the level are not changed here.
// onSubmit(values) must return a promise.
export default function StudentFormDialog({ student, onSubmit, onClose }) {
  const [values, setValues] = useState({
    full_name: student.full_name ?? '',
    phone: student.phone ?? '',
    gender: student.gender ?? '',
    birth_date: toDateInput(student.birth_date),
    guardian_phone: student.guardian_phone ?? '',
    address: student.address ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (values.full_name.trim().length < 3) return setError('Enter the full name (3+ characters)')
    setError('')
    setBusy(true)
    try {
      await onSubmit(values)
      onClose()
    } catch {
      // toast already shown
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>Edit student</DialogTitle>
            <DialogDescription>{student.email}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name" value={values.full_name} onChange={set('full_name')} error={error} className="sm:col-span-2" />
            <Field label="Phone" value={values.phone} onChange={set('phone')} />
            <Field label="Guardian phone" value={values.guardian_phone} onChange={set('guardian_phone')} />
            <Field label="Date of birth" type="date" value={values.birth_date} onChange={set('birth_date')} />
            <div className="flex flex-col gap-1.5">
              <Label>Gender</Label>
              <Select value={values.gender} onValueChange={(gender) => setValues((v) => ({ ...v, gender }))}>
                <SelectTrigger className="w-full" aria-label="Gender"><SelectValue placeholder="Choose" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Field label="Address" value={values.address} onChange={set('address')} className="sm:col-span-2" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
