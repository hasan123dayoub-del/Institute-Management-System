import { useEffect, useState } from 'react'
import { toast } from 'sonner'

// useLoad(load): runs `load()` (a function that returns a promise) when the page opens
// and again whenever you call reload() or `load` itself changes.
//
//   const { data, error, loading, reload } = useLoad(teachersApi.list)
//
// `load` must keep the same identity between renders: pass a function from api/*,
// or wrap your own in useCallback(() => api.list(filters), [filters]).
export function useLoad(load) {
  const [tick, setTick] = useState(0)
  const [result, setResult] = useState({ load: null, tick: -1, data: null, error: '' })

  useEffect(() => {
    let cancelled = false // ignore the answer if the page closed (or asked again) meanwhile
    load()
      .then((data) => !cancelled && setResult({ load, tick, data, error: '' }))
      .catch((err) => !cancelled && setResult({ load, tick, data: null, error: err.message }))
    return () => {
      cancelled = true
    }
  }, [load, tick])

  const fresh = result.load === load && result.tick === tick
  return {
    data: result.data,
    error: fresh ? result.error : '',
    loading: !fresh && result.data === null, // after a reload we keep showing the old data
    reload: () => setTick((t) => t + 1),
  }
}

// perform(action, 'Saved'): runs the action; success -> green toast, failure -> red toast with the
// server message, and the error is thrown again so a dialog can stay open.
export async function perform(action, successMessage) {
  try {
    const result = await action()
    if (successMessage) toast.success(successMessage)
    return result
  } catch (err) {
    toast.error(err.message)
    throw err
  }
}
