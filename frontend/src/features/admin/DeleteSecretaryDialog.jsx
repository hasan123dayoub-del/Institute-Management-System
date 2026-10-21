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

// "Are you sure?" box. AlertDialog (not Dialog) is the right one for dangerous actions:
// it cannot be closed by clicking outside, so a delete is never half-confirmed by accident.
export default function DeleteSecretaryDialog({ secretary, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)

  const confirm = async (e) => {
    e.preventDefault() // stop AlertDialog from closing by itself: we close only on success
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // e.g. 409 "last active secretary": the toast explains it, the box stays open
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {secretary.full_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Her account will be removed for good. If you only want to stop her from logging in, deactivate it instead.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={confirm} disabled={busy}>
            {busy ? 'Deleting…' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
