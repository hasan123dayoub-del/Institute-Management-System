import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// "Are you sure?" box for dangerous actions (delete, start a course...).
// AlertDialog (not Dialog) cannot be closed by clicking outside, so nothing is confirmed by accident.
// onConfirm must return a promise. If it fails, the box stays open (the error toast explains why).
export default function ConfirmDialog({ title, description, confirmLabel = 'Delete', destructive = true, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)

  const confirm = async (e) => {
    e.preventDefault() // AlertDialog would close itself: we close only when it worked
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // toast already shown
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={destructive ? 'destructive' : 'default'} onClick={confirm} disabled={busy}>
            {busy ? 'Working…' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
