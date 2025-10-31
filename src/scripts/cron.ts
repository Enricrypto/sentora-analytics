import { ingestSnapshots } from "@/lib/pairs/ingestSnapshots"

async function run() {
  console.log(`\n[${new Date().toISOString()}] Running ingestion...`)
  try {
    await ingestSnapshots()
  } catch (err) {
    console.error("Ingestion failed:", err)
  }
}

// Run immediately on start
run()

// Then run every 60 minutes
const intervalMs = 60 * 60 * 1000 // 60 minutes
setInterval(run, intervalMs)
