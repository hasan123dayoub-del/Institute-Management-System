import { useState } from 'react'
import Field from '@/components/Field.jsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DAYS, DAY_LABEL, SHIFT_WINDOW, classLabel } from '@/lib/format.js'

// Add a session, or move one (pass `session` to move). The class of an existing session cannot change.
// The same checks as the server are made here first: the end is after the start, and the time fits the shift.
// onSubmit({ class_id, day, start_time, end_time }) must return a promise.
export default function SessionDialog({ session, classes, onSubmit, onClose }) {
  const moving = Boolean(session)
  const [values, setValues] = useState({
    class_id: session?.class_id ?? '',
    day: session?.day ?? 'sun',
    start_time: session?.start_time ?? '',
    end_time: session?.end_time ?? '',
  })
  const [errors, setErrors] = useState({})
  const [busy, setBusy] = useState(false)
  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.target.value }))

  const cls = classes.find((c) => c.id === values.class_id)
  const window = cls && SHIFT_WINDOW[cls.shift]

  const submit = async (e) => {
    e.preventDefault()
    const found = {}
    if (!values.class_id) found.class_id = 'Choose the class'
    if (!values.start_time) found.start_time = 'Choose the start time'
    if (!values.end_time) found.end_time = 'Choose the end time'
    if (values.start_time && values.end_time && values.start_time >= values.end_time) found.end_time = 'The end must be after the start'
    if (window && values.start_time && values.end_time && !found.end_time && (values.start_time < window[0] || values.end_time > window[1]))
      found.start_time = `The ${cls.shift} shift is ${window[0]} to ${window[1]}`
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setBusy(true)
    try {
      await onSubmit(values)
      onClose()
    } catch {
      // toast already shown (for example: a clash with another of your sessions)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <DialogHeader>
            <DialogTitle>{moving ? 'Move session' : 'Add session'}</DialogTitle>
            <DialogDescription>
              {window ? `The ${cls.shift} shift runs from ${window[0]} to ${window[1]}.` : 'Choose the class first.'} The course end date is recalculated.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <Label>Class</Label>
            <Select value={values.class_id} onValueChange={(class_id) => setValues((v) => ({ ...v, class_id }))} disabled={moving}>
              <SelectTrigger className="w-full" aria-label="Class" aria-invalid={errors.class_id ? true : undefined}><SelectValue placeholder="Choose a class" /></SelectTrigger>
              <SelectContent>
                {classes.map((c) => <SelectItem key={c.id} value={c.id}>{classLabel(c)}</SelectItem>)}
              </SelectContent>
            </Select>
            {errors.class_id && <span className="text-xs text-destructive" role="alert">{errors.class_id}</span>}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <Label>Day</Label>
              <Select value={values.day} onValueChange={(day) => setValues((v) => ({ ...v, day }))}>
                <SelectTrigger className="w-full" aria-label="Day"><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{DAY_LABEL[d]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Field label="From" type="time" value={values.start_time} onChange={set('start_time')} error={errors.start_time} />
            <Field label="To" type="time" value={values.end_time} onChange={set('end_time')} error={errors.end_time} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : moving ? 'Move session' : 'Add session'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
