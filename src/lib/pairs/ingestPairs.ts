import { fetchAndStoreSnapshots } from "./fetchAndStoreSnapshots"

// List of pairs to track
const PAIRS = [
  "0xbc9d21652cca70f54351e3fb982c6b5dbe992a22",
  "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc"
]

/**
 * Ingest snapshots for all pairs.
 * - First run: backfills 48 hours of data.
 * - Subsequent runs: inserts latest snapshot only if last snapshot is older than 60 minutes.
 */
export async function ingestPairs() {
  for (const pair of PAIRS) {
    await fetchAndStoreSnapshots(pair)
  }
}
