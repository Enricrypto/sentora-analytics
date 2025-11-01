import { NextRequest, NextResponse } from "next/server"
import { ingestPairs } from "@/lib/pairs/ingestPairs"

/**
 * GET /api/ingest
 *
 * Triggers ingestion of pair data into the database by calling `ingestPairs()`.
 *
 * Response:
 *  - 200: { message: "Ingestion completed" }
 *  - 500: { error: "Ingestion failed" }
 */
export async function GET(req: NextRequest) {
  try {
    await ingestPairs()
    return NextResponse.json({ message: "Ingestion completed" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 })
  }
}
