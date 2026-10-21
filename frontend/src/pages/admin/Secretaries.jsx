import { KeyRound, Pencil, Plus, Power, Trash2 } from 'lucide-react'
import { useState } from 'react'
import * as secretariesApi from '@/api/secretaries.js'
import * as usersApi from '@/api/users.js'
import ConfirmDialog from '@/components/ConfirmDialog.jsx'
import SetPasswordDialog from '@/components/SetPasswordDialog.jsx'
import StatusPill from '@/components/StatusPill.jsx'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import SecretaryFormDialog from '@/features/admin/SecretaryFormDialog.jsx'
import { perform, useLoad } from '@/hooks/useLoad.js'
import { initialOf } from '@/lib/format.js'

// Admin: manage the secretary accounts (add, edit, set password, deactivate, delete).
// Talks to the real backend: GET/POST/PATCH/DELETE /secretaries and PATCH /users/:id/password.
export default function Secretaries() {
  const { data: items, error, loading, reload } = useLoad(secretariesApi.list)

  // Which dialog is open? null = none. Otherwise { type: 'create' | 'edit' | 'password' | 'delete', secretary }.
  const [dialog, setDialog] = useState(null)
  const close = () => setDialog(null)

  // run(action, message): do it, toast it, then refresh the list (only when it worked)
  const run = (action, message) => perform(action, message).then(reload)

  if (error) {
    return (
      <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-destructive" role="alert">
        {error}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
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
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold text-primary">
                        {initialOf(s.full_name)}
                      </span>
                      {s.full_name}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.email}</TableCell>
                  <TableCell className="font-mono text-xs">{s.phone || '—'}</TableCell>
                  <TableCell><StatusPill value={s.is_active ? 'enabled' : 'disabled'} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" title="Edit" aria-label={`Edit ${s.full_name}`} onClick={() => setDialog({ type: 'edit', secretary: s })}>
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" title="Set password" aria-label={`Set password for ${s.full_name}`} onClick={() => setDialog({ type: 'password', secretary: s })}>
                        <KeyRound aria-hidden="true" />
                      </Button>
                      {/* runs immediately: it is easy to undo, so no confirmation box */}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title={s.is_active ? 'Deactivate' : 'Activate'}
                        aria-label={`${s.is_active ? 'Deactivate' : 'Activate'} ${s.full_name}`}
                        onClick={() =>
                          run(
                            () => secretariesApi.update(s.id, { is_active: !s.is_active }),
                            s.is_active ? 'Account deactivated' : 'Account activated',
                          ).catch(() => {})
                        }
                      >
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
      {dialog?.type === 'create' && (
        <SecretaryFormDialog
          onSubmit={({ full_name, email, phone, password }) =>
            run(() => secretariesApi.create({ full_name, email, phone, password }), 'Secretary added')
          }
          onClose={close}
        />
      )}
      {dialog?.type === 'edit' && (
        <SecretaryFormDialog
          secretary={dialog.secretary}
          onSubmit={({ full_name, email, phone }) =>
            run(() => secretariesApi.update(dialog.secretary.id, { full_name, email, phone }), 'Changes saved')
          }
          onClose={close}
        />
      )}
      {dialog?.type === 'password' && (
        <SetPasswordDialog
          name={dialog.secretary.full_name}
          onSubmit={(password) => perform(() => usersApi.setPassword(dialog.secretary.id, password), 'Password changed')}
          onClose={close}
        />
      )}
      {dialog?.type === 'delete' && (
        <ConfirmDialog
          title={`Delete ${dialog.secretary.full_name}?`}
          description="Her account will be removed for good. If you only want to stop her from logging in, deactivate it instead."
          onConfirm={() => run(() => secretariesApi.remove(dialog.secretary.id), 'Secretary deleted')}
          onClose={close}
        />
      )}
    </div>
  )
}
