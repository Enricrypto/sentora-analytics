import dotenv from "dotenv"
import { prisma } from "@/lib/prisma"
import { fetchPairData, PairData } from "./fetchPairData"

dotenv.config()

export async function fetchAndStoreSnapshots(pair: string) {
  console.log(`Processing pair: ${pair}`)

  try {
    const hourlyData: PairData[] = await fetchPairData(pair)
    console.log(`Fetched ${hourlyData.length} hourly records for ${pair}`)

    // Check the latest snapshot in DB
    const lastSnapshot = await prisma.pairSnapshot.findFirst({
      where: { pair },
      orderBy: { timestamp: "desc" }
    })

    let toInsert: PairData[]

    if (!lastSnapshot) {
      // DB empty → insert all 48 hours
      toInsert = hourlyData
      console.log(
        `No existing snapshots found, inserting all ${toInsert.length}`
      )
    } else {
      // DB has data → insert only newer than last timestamp
      const lastTime = lastSnapshot.timestamp.getTime()
      toInsert = hourlyData.filter(
        (d) => new Date(d.timestamp).getTime() > lastTime
      )
      console.log(`Inserting ${toInsert.length} new snapshot(s)`)
    }

    if (toInsert.length === 0) {
      console.log(`No new snapshots to insert for ${pair}`)
      return
    }

    // Bulk insert using createMany
    await prisma.pairSnapshot.createMany({
      data: toInsert.map((snapshot) => ({
        pair,
        timestamp: new Date(snapshot.timestamp),
        liquidity: parseFloat(snapshot.reserveUSD),
        volume: parseFloat(snapshot.volumeUSD),
        fees: parseFloat(snapshot.feesUSD)
      })),
      skipDuplicates: true // ensures no duplicate timestamps are inserted
    })

    console.log(`Finished storing snapshots for ${pair}`)
  } catch (err) {
    console.error(`Failed to fetch/store snapshots for pair ${pair}:`, err)
  }
}
