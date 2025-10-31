import { NextRequest, NextResponse } from "next/server"
import { ingestPairs } from "@/lib/pairs/ingestPairs"

export async function GET(req: NextRequest) {
  try {
    await ingestPairs()
    return NextResponse.json({ message: "Ingestion completed" })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: "Ingestion failed" }, { status: 500 })
  }
}
