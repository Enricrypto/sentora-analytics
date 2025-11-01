import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { snapshotsQuerySchema } from "@/lib/schemas/snapshots"

/**
 * GET /api/snapshots
 *
 * Fetches raw pair snapshot data from the database.
 *
 * Query Parameters:
 *  - pair: string (optional) — token pair address to filter
 *  - limit: number (optional, default=100) — max number of snapshots to return (max 500)
 *  - offset: number (optional, default=0) — number of snapshots to skip
 *
 * Response:
 *  - 200: Array of snapshots, each with { id, pair, timestamp, liquidity, volume, fees }
 *  - 500: { error: string } — internal server error
 *
 * Example:
 *  GET /api/snapshots?pair=0x123...&limit=50&offset=0
 */
export async function GET(req: NextRequest) {
  try {
    // Parse query parameters from URL
    const url = new URL(req.url)
    const query = Object.fromEntries(url.searchParams.entries())

    const { pair, limit = 100, offset = 0 } = snapshotsQuerySchema.parse(query)

    const where = pair ? { pair } : undefined

    const snapshots = await prisma.pairSnapshot.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: Math.min(limit, 500),
      skip: offset
    })

    return NextResponse.json(snapshots)
  } catch (err) {
    console.error("Error fetching snapshots:", err)
    return NextResponse.json(
      { error: "Failed to fetch snapshots" },
      { status: 500 }
    )
  }
}
