import { prisma } from "@/lib/prisma"
import { fetchAndStoreSnapshot } from "./fetchAndStoreSnapshot"
import { PAIRS } from "@/app/constants"
import { INITIAL_FETCH_HOURS, SNAPSHOT_INTERVAL_MINUTES } from "@/app/constants"

function subtractHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

export async function ingestSnapshots() {
  const now = new Date()

  // Map each pair to a processing promise
  const pairPromises = PAIRS.map(async (pairObj) => {
    const pair = pairObj.value
    console.log(`\nProcessing pair: ${pair}`)

    let lastSnapshot
    try {
      lastSnapshot = await prisma.pairSnapshot.findFirst({
        where: { pair },
        orderBy: { timestamp: "desc" }
      })
    } catch (err) {
      console.error(`Failed to fetch last snapshot for pair ${pair}:`, err)
      return
    }

    const startTimes: Date[] = []

    if (!lastSnapshot) {
      // First run → fetch past 48h hourly snapshots
      for (let h = INITIAL_FETCH_HOURS; h > 0; h--) {
        startTimes.push(subtractHours(now, h))
      }
    } else {
      const diffMinutes =
        (now.getTime() - lastSnapshot.timestamp.getTime()) / 1000 / 60

      // Only take a new snapshot if the last one is older than SNAPSHOT_INTERVAL_MINUTES (60 min)
      // This prevents duplicate snapshots when the ingestion script runs multiple times within the same interval
      if (diffMinutes < SNAPSHOT_INTERVAL_MINUTES) {
        console.log(
          `Last snapshot is only ${diffMinutes.toFixed(0)} min ago. Skipping.`
        )
        return
      }

      // Schedule the next snapshot based on the last one
      startTimes.push(
        new Date(
          lastSnapshot.timestamp.getTime() +
            SNAPSHOT_INTERVAL_MINUTES * 60 * 1000
        )
      )
    }

    // Fetch & store snapshots sequentially for this pair
    for (const start of startTimes) {
      await fetchAndStoreSnapshot(pair, start)
    }
  })

  // Wait for all pairs to finish
  await Promise.all(pairPromises)

  await prisma.$disconnect()
  console.log("\nAll done!")
}

// Run the ingestion
ingestSnapshots()
