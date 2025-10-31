import { calculateAPR } from "./apr"

/**
 * Efficiently computes a moving-average APR over a given time window.
 * Instead of recalculating the average from scratch for every snapshot (which would require 
 * slicing the array and summing over N items each time), we use a **sliding window** 
 * technique with running totals (`totalFees`, `totalLiquidity`) for O(n) performance.

 * Suitable for high-frequency DeFi metrics or large historical datasets.
 *
 * @param snapshots - Array of pair snapshots, each with { timestamp, fees, liquidity }
 * @param windowSize - Size of the moving window (e.g., 1, 12, 24)
 * @returns Array of { timestamp, apr } representing the smoothed APR series
 */
export function calculateMovingAverageAPR(
  snapshots: { timestamp: Date; fees: number; liquidity: number }[],
  windowSize: number
) {
  let totalFees = 0
  let totalLiquidity = 0
  const result: { timestamp: Date; apr: number }[] = []

  for (let i = 0; i < snapshots.length; i++) {
    const snap = snapshots[i]
    totalFees += snap.fees
    totalLiquidity += snap.liquidity

    // Remove the oldest snapshot when window exceeds the target size
    if (i >= windowSize) {
      totalFees -= snapshots[i - windowSize].fees
      totalLiquidity -= snapshots[i - windowSize].liquidity
    }

    const avgApr = calculateAPR(totalFees, totalLiquidity, windowSize)

    result.push({
      timestamp: snap.timestamp,
      apr: avgApr
    })
  }

  return result
}
