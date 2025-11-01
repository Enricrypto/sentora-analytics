import { useState, useEffect } from "react"

// Represents a single APR data point returned from the API
// Note: timestamp comes as ISO string from the server
type AprPoint = { timestamp: string; apr: number }

// Parameters for the hook
interface UseAprSeriesParams {
  pair: string
  fromISO: string
  toISO: string
  maHours: 1 | 12 | 24
}

/**
 * Custom React hook to fetch and calculate the moving-average APR series for a given pair.
 *
 * This hook:
 * - Fetches snapshots from the `/api/metrics` route
 * - Uses the `maHours` parameter to get the moving average APR from the server
 * - Handles loading and error states
 * - Updates automatically whenever any dependency changes (pair, date range, or MA)
 *
 * @param params - Object containing pair, fromDate, toDate, and maHours
 * @returns { data, loading, error } - The APR series, loading state, and any error encountered
 */
export function useAprSeries({
  pair,
  fromISO,
  toISO,
  maHours
}: UseAprSeriesParams) {
  // State: the APR series data points
  const [data, setData] = useState<AprPoint[]>([])
  // State: whether the data is being fetched
  const [loading, setLoading] = useState(true)
  // State: any error encountered during fetch
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip fetching if no pair selected
    if (!pair) return

    // Reset loading/error states
    setLoading(true)
    setError(null)

    // Async function to fetch metrics from the API
    const fetchApr = async () => {
      try {
        const res = await fetch(
          `/api/metrics?pair=${pair}&from=${fromISO}&to=${toISO}&ma=${maHours}`
        )
        // Throw if response is not ok
        if (!res.ok) throw new Error("Failed to fetch metrics")

        const metrics = await res.json()
        // The server response is structured as { pair, metrics }
        setData(metrics.metrics)
      } catch (err: unknown) {
        // Catch errors and update state
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError("Unknown error")
        }
      } finally {
        // Loading is finished regardless of success or failure
        setLoading(false)
      }
    }

    // Trigger fetch
    fetchApr()
  }, [pair, fromISO, toISO, maHours]) // Re-run effect when any dependency changes

  // Return the APR series, loading state, and error
  return { data, loading, error }
}
