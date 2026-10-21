import { KeyRound, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { useState } from 'react'
import StatusPill from '@/components/StatusPill.jsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { USE_SAMPLE_DATA } from '@/features/admin/config.js'
import DeleteSecretaryDialog from '@/features/admin/DeleteSecretaryDialog.jsx'
import SecretaryFormDialog from '@/features/admin/SecretaryFormDialog.jsx'
import SecretaryPasswordDialog from '@/features/admin/SecretaryPasswordDialog.jsx'
import { useSecretaries } from '@/features/admin/useSecretaries.js'

// Admin: manage the secretary accounts (add, edit, set password, deactivate, delete).
export default function Secretaries() {
  const { items, error, loading, create, update, toggleActive, changePassword, remove } = useSecretaries()

  // Which dialog is open? null = none. Otherwise { type: 'create' | 'edit' | 'password' | 'delete', secretary }.
  const [dialog, setDialog] = useState(null)
  const close = () => setDialog(null)

  if (error) {
    return (
      <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {USE_SAMPLE_DATA && (
        <Badge variant="outline" className="w-fit">Sample data: changes are lost when you reload</Badge>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {loading ? 'Loading…' : `${items.length} accounts · ${items.filter((s) => s.is_active).length} active`}
        </p>
        <Button onClick={() => setDialog({ type: 'create' })}>
          <Plus aria-hidden="true" />
          Add secretary
        </Button>
      </div>

      <Card className="py-2">
        <CardContent className="px-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Secretary</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-end">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading &&
                Array.from({ length: 3 }, (_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell>
                  </TableRow>
                ))}

              {items?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No secretaries yet. Add the first one.
                  </TableCell>
                </TableRow>
              )}

              {items?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-2 font-medium">
                      {/* the round badge with her first letter */}
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                        {s.full_name[0]}
                      </span>
                      {s.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.email}</TableCell>
                  <TableCell className="font-mono text-xs">{s.phone}</TableCell>
                  <TableCell><StatusPill value={s.is_active ? 'enabled' : 'disabled'} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title="Edit" aria-label={`Edit ${s.full_name}`} onClick={() => setDialog({ type: 'edit', secretary: s })}>
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Set password" aria-label={`Set password for ${s.full_name}`} onClick={() => setDialog({ type: 'password', secretary: s })}>
                        <KeyRound aria-hidden="true" />
                      </Button>
                      {/* toggleActive runs immediately: it is easy to undo, so no confirmation box */}
                      <Button variant="ghost" size="icon-sm" title={s.is_active ? 'Deactivate' : 'Activate'} aria-label={`${s.is_active ? 'Deactivate' : 'Activate'} ${s.full_name}`} onClick={() => toggleActive(s).catch(() => {})}>
                        <Power aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" className="text-destructive hover:text-destructive" title="Delete" aria-label={`Delete ${s.full_name}`} onClick={() => setDialog({ type: 'delete', secretary: s })}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Only the dialog that matches `dialog.type` is mounted, so its form starts fresh each time. */}
      {dialog?.type === 'create' && <SecretaryFormDialog onSubmit={create} onClose={close} />}
      {dialog?.type === 'edit' && (
        <SecretaryFormDialog
          secretary={dialog.secretary}
          onSubmit={({ full_name, email, phone }) => update(dialog.secretary.id, { full_name, email, phone })}
          onClose={close}
        />
      )}
      {dialog?.type === 'password' && (
        <SecretaryPasswordDialog
          secretary={dialog.secretary}
          onSubmit={(password) => changePassword(dialog.secretary.id, password)}
          onClose={close}
        />
      )}
      {dialog?.type === 'delete' && (
        <DeleteSecretaryDialog
          secretary={dialog.secretary}
          onConfirm={() => remove(dialog.secretary.id)}
          onClose={close}
        />
      )}
    </div>
  )
}
