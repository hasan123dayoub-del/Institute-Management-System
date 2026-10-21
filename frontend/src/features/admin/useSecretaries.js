import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { source } from './secretariesSource.js'

// Loads the secretaries and gives the page one function per action.
// Every action: call the source -> show a toast -> reload the list.
// If it fails we show the error as a toast and re-throw, so a dialog can stay open.
export function useSecretaries() {
  const [items, setItems] = useState(null) // null = still loading
  const [error, setError] = useState('')

  // Used after every action, to show the fresh list.
  const reload = useCallback(async () => {
    try {
      setItems(await source.list())
    } catch (err) {
      setError(err.message)
    }
  }, [])

  // First load when the page opens. `cancelled` ignores the answer if the page was closed meanwhile.
  useEffect(() => {
    let cancelled = false
    source
      .list()
      .then((rows) => !cancelled && setItems(rows))
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [])

  // Wraps an action with the "toast + reload" behaviour described above.
  const act = useCallback(
    async (action, successMessage) => {
      try {
        await action()
      } catch (err) {
        toast.error(err.message)
        throw err
      }
      toast.success(successMessage)
      await reload()
    },
    [reload],
  )

  return {
    items,
    error,
    loading: items === null && !error,
    create: (values) => act(() => source.create(values), 'Secretary added'),
    update: (id, changes) => act(() => source.update(id, changes), 'Changes saved'),
    toggleActive: (s) =>
      act(() => source.update(s.id, { is_active: !s.is_active }), s.is_active ? 'Account deactivated' : 'Account activated'),
    changePassword: (id, password) => act(() => source.setPassword(id, password), 'Password changed'),
    remove: (id) => act(() => source.remove(id), 'Secretary deleted'),
  }
}
