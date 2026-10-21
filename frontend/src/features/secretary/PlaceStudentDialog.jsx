import { useState } from 'react'
import * as classesApi from '@/api/classes.js'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useLoad } from '@/hooks/useLoad.js'
import ClassOptions from './ClassOptions.jsx'

// Put a waiting student in a class, or move a student to another class.
// The rules (also checked by the server): same level, the class is open or running, and it is not full.
// onSubmit(classId) must return a promise.
export default function PlaceStudentDialog({ student, onSubmit, onClose }) {
  const { data: classes, loading } = useLoad(classesApi.list)
  const [selected, setSelected] = useState(null)
  const [busy, setBusy] = useState(false)

  const moving = Boolean(student.class)
  const options = (classes ?? []).filter(
    (c) => c.level === student.level && c.status !== 'finished' && c.id !== student.class?.id,
  )

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      await onSubmit(selected)
      onClose()
    } catch {
      // toast already shown (for example: the class just became full)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{moving ? 'Move to another class' : 'Place in a class'}</DialogTitle>
            <DialogDescription>
              {student.full_name} is at level {student.level}.
              {moving ? ` Now in ${student.class.label}. Their grades move with them.` : ' Choose a class at the same level.'}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <ClassOptions classes={options} value={selected} onChange={setSelected} emptyText={`No open or running class at ${student.level} right now.`} />
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy || !selected}>{busy ? 'Saving…' : moving ? 'Move student' : 'Place student'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
