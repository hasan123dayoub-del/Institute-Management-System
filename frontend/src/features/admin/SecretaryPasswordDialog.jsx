import { useState } from 'react'
import PasswordField from '@/components/PasswordField.jsx'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// The admin sets a secretary's password. Secretaries cannot change it themselves.
export default function SecretaryPasswordDialog({ secretary, onSubmit, onClose }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (password.length < 8) return setError('At least 8 characters')
    setError('')
    setBusy(true)
    try {
      await onSubmit(password)
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
            <DialogTitle>New password</DialogTitle>
            <DialogDescription>For {secretary.full_name}. Give it to her yourself: it cannot be seen again.</DialogDescription>
          </DialogHeader>
          <PasswordField label="New password" value={password} onChange={setPassword} error={error} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Change password'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
