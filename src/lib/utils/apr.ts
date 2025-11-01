/**
 * Computes the annualized APR (Annual Percentage Rate) for a given snapshot.
 * APR reflects the percentage return that liquidity providers earn based on fees collected
 * relative to the liquidity they provided.
 *
 * @param fees - Total fees collected in the snapshot window
 * @param liquidity - Total liquidity provided in the snapshot window
 * @param hours - Duration of the snapshot window in hours (default: 24)
 * @returns Annualized APR as a percentage
 */
export function calculateAPR(
  fees: number,
  liquidity: number,
  hours = 24
): number {
  // If no liquidity, APR is zero
  if (liquidity === 0) return 0

  // Annualized APR formula:
  // (fees / liquidity) gives the return for the snapshot window
  // Multiply by (365 * 24 / hours) to scale it to a full year
  return (fees / liquidity) * ((365 * 24) / hours) * 100
}
