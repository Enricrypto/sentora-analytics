// Isolated process:
// Your ingestSnapshots.ts is a fully independent script — it runs on its own, connects to the API, fetches data, and stores it in the database.

import dotenv from "dotenv"
import { prisma } from "@/lib/prisma"
import { fetchAndStoreSnapshots } from "./fetchAndStoreSnapshots"
import { PAIRS } from "@/app/constants"
import { INITIAL_FETCH_HOURS, SNAPSHOT_INTERVAL_MINUTES } from "@/app/constants"

dotenv.config()

function subtractHours(date: Date, hours: number) {
  return new Date(date.getTime() - hours * 60 * 60 * 1000)
}

export async function ingestSnapshots() {
  const now = new Date()

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

    // Determine which timestamps we need to fetch
    const startTimes: Date[] = []

    if (!lastSnapshot) {
      // First run → fetch past INITIAL_FETCH_HOURS hourly snapshots
      for (let h = INITIAL_FETCH_HOURS; h > 0; h--) {
        startTimes.push(subtractHours(now, h))
      }
      console.log(
        `No snapshots for ${pair}. Scheduling ${startTimes.length} initial fetches.`
      )
    } else {
      const diffMinutes =
        (now.getTime() - lastSnapshot.timestamp.getTime()) / 1000 / 60
      if (diffMinutes < SNAPSHOT_INTERVAL_MINUTES) {
        console.log(
          `Last snapshot for ${pair} is only ${diffMinutes.toFixed(
            0
          )} min ago. Skipping.`
        )
        return
      }

      // Schedule next snapshot(s) starting after last timestamp
      const nextTime = new Date(
        lastSnapshot.timestamp.getTime() + SNAPSHOT_INTERVAL_MINUTES * 60 * 1000
      )
      startTimes.push(nextTime)
      console.log(
        `Scheduling fetch for ${pair} starting at ${nextTime.toISOString()}`
      )
    }

    // Fetch & store snapshots hour by hour
    for (const ts of startTimes) {
      console.log(`Scheduled snapshot for ${pair} at ${ts.toISOString()}`)
    }
    await fetchAndStoreSnapshots(pair)
  })

  // Wait for all pairs to finish
  await Promise.all(pairPromises)

  await prisma.$disconnect()
  console.log("\nAll snapshots ingestion completed!")
}

// Run the ingestion
ingestSnapshots()
