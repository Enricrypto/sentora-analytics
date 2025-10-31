export const mockSnapshots = [
  { timestamp: new Date(), liquidity: 1000000, fees: 3000 },
  {
    timestamp: new Date(Date.now() - 3600 * 1000),
    liquidity: 1200000,
    fees: 3600
  },
  {
    timestamp: new Date(Date.now() - 2 * 3600 * 1000),
    liquidity: 1100000,
    fees: 3300
  }
]
