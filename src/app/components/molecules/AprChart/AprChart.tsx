// Pair selector: lets user switch between the two pairs.
// Moving Average selector: dynamically updates ma for the chart.
// The chart fetches new data whenever either changes.
// fetchData is memoized with useCallback — effect only runs when dependencies change.

"use client"

import { useState, useEffect, useCallback } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { PAIRS } from "@/app/constants"

type AprPoint = {
  timestamp: string
  apr: number
}

export function AprChart() {
  const [pair, setPair] = useState(PAIRS[0].value)
  const [movingAvgHours, setMovingAvgHours] = useState(12)
  const [data, setData] = useState<AprPoint[]>([])
  const [loading, setLoading] = useState(true)

  // function to fetch data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      const params = new URLSearchParams({
        pair,
        from: oneDayAgo.toISOString(),
        to: now.toISOString(),
        ma: movingAvgHours.toString()
      })

      const res = await fetch(`/api/pair-metrics?${params.toString()}`)
      const json = await res.json()
      setData(json.data || [])
    } catch (err) {
      console.error(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [pair, movingAvgHours])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <select value={pair} onChange={(e) => setPair(e.target.value)}>
          {PAIRS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        <select
          value={movingAvgHours}
          onChange={(e) => setMovingAvgHours(Number(e.target.value))}
        >
          {[1, 12, 24].map((h) => (
            <option key={h} value={h}>
              {h}-hour MA
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No data available</p>
      ) : (
        <ResponsiveContainer width='100%' height={300}>
          <LineChart data={data}>
            <XAxis
              dataKey='timestamp'
              tickFormatter={(t) => new Date(t).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(t) => new Date(t).toLocaleString()}
              formatter={(value: number) => value.toFixed(2) + "%"}
            />
            <Line type='monotone' dataKey='apr' stroke='#8884d8' dot={false} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
