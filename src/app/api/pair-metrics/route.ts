// Fetches snapshots from the database for the pair and date range.
// Calculates APR as a moving average over ma hours (1, 12, 24).

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateMovingAverageAPR } from "@/lib/utils/analytics"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const pair = searchParams.get("pair")
    const from = searchParams.get("from")
    const to = searchParams.get("to")
    const movingAvgHours = parseInt(searchParams.get("ma") || "1", 10) // 1,12,24

    if (!pair || !from || !to) {
      return NextResponse.json(
        { error: "Missing query parameters" },
        { status: 400 }
      )
    }

    const snapshots = await prisma.pairSnapshot.findMany({
      where: {
        pair,
        timestamp: {
          gte: new Date(from),
          lte: new Date(to)
        }
      },
      orderBy: { timestamp: "asc" }
    })

    // Calculate moving average with helper function
    const result = calculateMovingAverageAPR(snapshots, movingAvgHours)

    return NextResponse.json({ data: result })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    )
  }
}
