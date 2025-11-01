import { calculateAPR } from "./apr"

/**
 * Computes a moving-average APR over a time window defined in hours.
 * Works even if snapshots are irregularly spaced.
 *
 * @param snapshots - Array of pair snapshots { timestamp, fees, liquidity }
 * @param windowHours - Size of the moving window in hours (e.g., 1, 12, 24)
 * @returns Array of { timestamp, apr } representing the smoothed APR series
 */
export function calculateMovingAverageAPRByHours(
  snapshots: { timestamp: Date; fees: number; liquidity: number }[],
  windowHours: number
) {
  const result: { timestamp: Date; apr: number }[] = []
  const window: { timestamp: Date; fees: number; liquidity: number }[] = []

  let totalFees = 0
  let totalLiquidity = 0

  for (const snap of snapshots) {
    // Add current snapshot to the window
    window.push(snap)
    totalFees += snap.fees
    totalLiquidity += snap.liquidity

    // Remove snapshots outside the time window
    // Removing old snapshots ensures APR calculation only reflects the current time window,
    // which is exactly what you want for a moving average.
    const windowStart = new Date(
      snap.timestamp.getTime() - windowHours * 60 * 60 * 1000
    )
    while (window.length && window[0].timestamp < windowStart) {
      totalFees -= window[0].fees
      totalLiquidity -= window[0].liquidity
      window.shift()
    }

    // Calculate APR based on the current window
    const avgApr = calculateAPR(totalFees, totalLiquidity, windowHours)
    result.push({ timestamp: snap.timestamp, apr: avgApr })
  }

  return result
}
