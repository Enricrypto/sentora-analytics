// Checks last snapshot timestamp → only fetch if > 60 minutes.
// Fetches latest data using fetchPairData.
// Stores a new snapshot in SQLite / PostgreSQL using Prisma.

import { PrismaClient } from "@prisma/client"
import { fetchPairData } from "./fetchPairData"

const prisma = new PrismaClient()

// List your pairs here
const PAIRS = [
  "0xbc9d21652cca70f54351e3fb982c6b5dbe992a22",
  "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"
]

export async function ingestPairs() {
  for (const pair of PAIRS) {
    // Check last snapshot
    const lastSnapshot = await prisma.pairSnapshot.findFirst({
      where: { pair },
      orderBy: { timestamp: "desc" }
    })

    const now = new Date()
    if (lastSnapshot) {
      const diff =
        (now.getTime() - lastSnapshot.timestamp.getTime()) / (1000 * 60) // minutes
      if (diff < 60) {
        console.log(
          `Skipping ${pair}, last snapshot ${diff.toFixed(1)} minutes ago`
        )
        continue
      }
    }

    // Fetch pair data
    const data = await fetchPairData(pair)

    // Store snapshot
    await prisma.pairSnapshot.create({
      data: {
        pair,
        timestamp: now,
        liquidity: parseFloat(data.reserveUSD),
        volume: parseFloat(data.volumeUSD),
        fees: parseFloat(data.feesUSD)
      }
    })

    console.log(`Snapshot stored for pair ${pair} at ${now.toISOString()}`)
  }
}
