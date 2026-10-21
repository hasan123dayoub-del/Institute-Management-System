import { useState } from 'react'
import * as studentsApi from '@/api/students.js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoad } from '@/hooks/useLoad.js'
import { classLabel } from '@/lib/format.js'
import { cn } from '@/lib/utils'

// From a class page: pick one of the WAITING students at the class level and put them in this class.
// onSubmit(studentId) must return a promise.
export default function AddStudentDialog({ cls, onSubmit, onClose }) {
  const { data: students, loading } = useLoad(studentsApi.list)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)

  const waiting = (students ?? []).filter((s) => s.status === 'waiting' && s.level === cls.level)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSubmit(selected)
      onClose()
    } catch {
      // toast already shown
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Add a student to {classLabel(cls)}</DialogTitle>
            <DialogDescription>Students waiting for a class at level {cls.level}. {cls.capacity - cls.students_count} seats left.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : waiting.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nobody is waiting at {cls.level}. Register a new student first.</p>
          ) : (
            <div role="radiogroup" className="flex max-h-72 flex-col gap-2 overflow-y-auto">
              {waiting.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  role="radio"
                  aria-checked={selected === s.id}
                  onClick={() => setSelected(s.id)}
                  className={cn('flex items-center justify-between rounded-md border px-3 py-2 text-start text-sm transition-colors', selected === s.id ? 'border-primary bg-accent' : 'hover:bg-muted')}
                >
                  {s.full_name}
                  <span className="font-mono text-xs text-muted-foreground">{s.phone}</span>
                </button>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy || !selected}>{busy ? 'Saving…' : 'Add to class'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
