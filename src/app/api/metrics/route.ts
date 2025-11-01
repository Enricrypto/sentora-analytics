import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateMovingAverageAPRByHours } from "@/lib/utils/analytics"

/**
 * GET /api/metrics
 *
 * Fetches the APR metrics for a specific pair over a date range, optionally applying a moving average.
 *
 * Query Parameters:
 *  - pair: string (required) — token pair address
 *  - from: string (required) — ISO date start of the range
 *  - to: string (required) — ISO date end of the range
 *  - ma: number (optional, default=1) — moving average window in hours (allowed: 1, 12, 24)
 *
 * Response:
 *  - 200: { pair: string, metrics: { timestamp: string, apr: number }[] }
 *  - 400: { error: string } — invalid or missing query parameters
 *  - 500: { error: string } — internal server error
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const pair = url.searchParams.get("pair")
    const from = url.searchParams.get("from")
    const to = url.searchParams.get("to")
    const ma = url.searchParams.get("ma") || "1"

    if (!pair || !from || !to) {
      return NextResponse.json(
        { error: "Missing query params" },
        { status: 400 }
      )
    }

    const fromDate = new Date(from)
    const toDate = new Date(to)

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format" },
        { status: 400 }
      )
    }

    // Ensure maHours is one of 1, 12, 24
    const allowedMa = [1, 12, 24]
    const maHours = Number(ma)
    if (!allowedMa.includes(maHours)) {
      return NextResponse.json(
        { error: "Invalid ma parameter, must be 1, 12, or 24" },
        { status: 400 }
      )
    }

    const snapshots = await prisma.pairSnapshot.findMany({
      where: {
        pair,
        timestamp: { gte: fromDate, lte: toDate }
      },
      orderBy: { timestamp: "asc" }
    })

    const metrics = calculateMovingAverageAPRByHours(snapshots, maHours)

    // Return structured response
    return NextResponse.json({ pair, metrics })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
