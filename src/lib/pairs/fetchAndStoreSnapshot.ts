import { prisma } from "@/lib/prisma"
import { fetchPairData } from "./fetchPairData"

/**
 * Fetches data for a single pair at a given timestamp and stores it in the database.
 * @param pair - The pair address to fetch
 * @param timestamp - The timestamp for the snapshot
 */
export async function fetchAndStoreSnapshot(pair: string, timestamp: Date) {
  console.log(`Processing pair: ${pair} at ${timestamp.toISOString()}`)

  try {
    const data = await fetchPairData(pair)
    console.log(`Fetched data for ${pair}:`, data)

    // Insert a new record into the PairSnapshot table
    const snapshot = await prisma.pairSnapshot.create({
      data: {
        pair,
        timestamp,
        liquidity: parseFloat(data.reserveUSD),
        volume: parseFloat(data.volumeUSD),
        fees: parseFloat(data.feesUSD)
      }
    })

    console.log(
      `Stored snapshot for ${pair} at ${snapshot.timestamp.toISOString()}`
    )
  } catch (err) {
    console.error(`Failed to fetch/store snapshot for pair ${pair}:`, err)
  }
}
