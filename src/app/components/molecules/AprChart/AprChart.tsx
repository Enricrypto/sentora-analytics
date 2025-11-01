/**
 * AprChart component
 *
 * Displays a line chart of APR (Annual Percentage Rate) for a selected trading pair
 * over the last 24 hours.
 *
 * Features:
 * - Pair selector: allows switching between available trading pairs.
 * - Moving Average selector: choose 1h, 12h, or 24h moving average for smoothing APR.
 * - Chart updates automatically whenever either selector changes via `useAprSeries` hook.
 *
 * Uses:
 * ```ts
 * <AprChart />
 * ```
 */
"use client"

import { useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import { PAIRS } from "@/app/constants"
import { useAprSeries } from "@/hooks/useAprSeries"

export function AprChart() {
  /** Currently selected trading pair */
  const [pair, setPair] = useState(PAIRS[0].value)

  /** Selected moving average window (in hours) */
  const [movingAvgHours, setMovingAvgHours] = useState<1 | 12 | 24>(12)

  /** Compute 24-hour time range for fetching metrics */
  const { fromISO, toISO } = useMemo(() => {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    return {
      fromISO: oneDayAgo.toISOString(),
      toISO: now.toISOString()
    }
  }, []) // empty deps = compute once on mount

  /** Fetch APR series for the selected pair and moving average */
  const { data, loading } = useAprSeries({
    pair,
    fromISO,
    toISO,
    maHours: movingAvgHours
  })

  console.log(data.map((d) => ({ t: d.timestamp, apr: d.apr })))

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {/* Pair selector */}
        <select value={pair} onChange={(e) => setPair(e.target.value)}>
          {PAIRS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {/* Moving Average selector */}
        <select
          value={movingAvgHours}
          onChange={(e) =>
            setMovingAvgHours(Number(e.target.value) as 1 | 12 | 24)
          }
        >
          {[1, 12, 24].map((h) => (
            <option key={h} value={h}>
              {h}-hour MA
            </option>
          ))}
        </select>
      </div>

      {/* Chart rendering */}
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
