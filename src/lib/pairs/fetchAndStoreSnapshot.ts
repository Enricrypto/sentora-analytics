import { prisma } from "@/lib/prisma"
import { fetchPairData, PairData } from "./fetchPairData"

export async function fetchAndStoreSnapshot(pair: string, timestamp: Date) {
  console.log(`Processing pair: ${pair} at ${timestamp.toISOString()}`)

  // Fetch last 48 hours of hourly data
  const hourlyData: PairData[] = await fetchPairData(pair)
  console.log(`Fetched hourly data for ${pair}:`, hourlyData)

  // Determine if DB is empty for this pair
  const lastSnapshot = await prisma.pairSnapshot.findFirst({
    where: { pair },
    orderBy: { timestamp: "desc" }
  })

  // First run = no snapshot exists → backfill all 48 hours
  if (!lastSnapshot) {
    console.log(`No snapshots found for ${pair}, backfilling 48 hours`)
    for (const hour of hourlyData.reverse()) {
      await prisma.pairSnapshot.create({
        data: {
          pair,
          timestamp: new Date(hour.timestamp),
          liquidity: parseFloat(hour.reserveUSD),
          volume: parseFloat(hour.volumeUSD),
          fees: parseFloat(hour.feesUSD)
        }
      })
    }
    console.log(`Backfill complete for ${pair}`)
    return
  }

  // Subsequent runs → only insert latest if last snapshot > 60 min
  const diffMinutes =
    (timestamp.getTime() - lastSnapshot.timestamp.getTime()) / (1000 * 60)

  if (diffMinutes < 60) {
    console.log(
      `Skipping ${pair}, last snapshot ${diffMinutes.toFixed(1)} minutes ago`
    )
    return
  }

  // Insert latest hourly snapshot
  const latest = hourlyData[0]
  await prisma.pairSnapshot.create({
    data: {
      pair,
      timestamp,
      liquidity: parseFloat(latest.reserveUSD),
      volume: parseFloat(latest.volumeUSD),
      fees: parseFloat(latest.feesUSD)
    }
  })
  console.log(
    `Stored latest snapshot for ${pair} at ${timestamp.toISOString()}`
  )
}
