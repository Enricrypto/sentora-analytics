// Helper: calculate APR based on volume, fees, liquidity
export function calculateAPR(
  fees: number,
  liquidity: number,
  hours = 24
): number {
  // Annualized: (fees / liquidity) * (365 * 24 / hours)
  return liquidity === 0 ? 0 : (fees / liquidity) * ((365 * 24) / hours) * 100
}
