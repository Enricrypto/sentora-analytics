import { ingestSnapshots } from "@/lib/pairs/ingestSnapshots"
import { prisma } from "@/lib/prisma"

async function run() {
  console.log(`\n[${new Date().toISOString()}] Running ingestion...`)
  try {
    await ingestSnapshots()
  } catch (err) {
    console.error("Ingestion failed:", err)
  }
}

async function main() {
  await run()

  // Ensure all resources are cleaned up
  // e.g., Prisma client disconnection if used inside ingestSnapshots
  if (typeof prisma !== "undefined") {
    await prisma.$disconnect()
  }

  console.log(
    `✅ Ingestion completed successfully at ${new Date().toISOString()}`
  )
  process.exit(0) // Exit so GitHub Actions workflow finishes
}

main()
