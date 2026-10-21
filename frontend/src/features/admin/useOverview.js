import { useEffect, useState } from 'react'
import * as statsApi from '@/api/stats.js'
import { USE_SAMPLE_DATA } from './config.js'
import { OVERVIEW } from './mock.js'

// A "hook" is a function that starts with `use` and can keep state inside a component.
// This one loads the dashboard numbers and tells the page: still loading? failed? here is the data.
export function useOverview() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false // if the page closes before the answer arrives, ignore the answer
    const request = USE_SAMPLE_DATA
      ? new Promise((resolve) => setTimeout(() => resolve(OVERVIEW), 400)) // fake delay, to see the skeletons
      : statsApi.overview()

    request
      .then((result) => !cancelled && setData(result))
      .catch((err) => !cancelled && setError(err.message))
    return () => {
      cancelled = true
    }
  }, [])

  return { data, error, loading: data === null && !error }
}
