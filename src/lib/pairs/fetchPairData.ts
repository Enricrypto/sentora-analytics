import dotenv from "dotenv"
import { request, gql } from "graphql-request"
import { ENDPOINT } from "@/app/constants"

dotenv.config()
console.log(
  "🔑 THEGRAPH_API_KEY loaded as:",
  process.env.THEGRAPH_API_KEY ? "✅ Exists" : "❌ Missing"
)

// -----------------------------------------------------
// Type definition for pair hourly data returned from The Graph
// Each entry represents one hourly snapshot of the pair
// -----------------------------------------------------
export type PairData = {
  timestamp: string // ISO timestamp for the snapshot hour
  reserveUSD: string // Total liquidity value in USD
  volumeUSD: string // Trading volume in USD for that hour
  feesUSD: string // Calculated 0.3% fees from hourly volume
  token0Symbol: string // Symbol of the first token in the pair
  token1Symbol: string // Symbol of the second token in the pair
}

// -----------------------------------------------------
// Fetch hourly data for a given pair from The Graph
// Used both for the initial 48h historical load and
// for the latest hourly snapshots in the cron process.
// -----------------------------------------------------
export async function fetchPairData(
  pairAddress: string,
  limit: number = 48 // Default: fetch last 48 hours of data
): Promise<PairData[]> {
  // GraphQL query to fetch hourly metrics for a pair + token symbols
  const query = gql`
    query PairHourData($pair: String!, $first: Int!) {
      pairHourDatas(
        first: $first
        orderBy: hourStartUnix
        orderDirection: desc
        where: { pair: $pair }
      ) {
        hourStartUnix
        reserveUSD
        hourlyVolumeUSD
        reserve0
        reserve1
        totalSupply
        id
      }
      pair(id: $pair) {
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
    }
  `

  // Auth header required by The Graph’s API key
  const headers = {
    Authorization: `Bearer ${process.env.THEGRAPH_API_KEY}`
  }

  // Execute GraphQL request
  const data: {
    pairHourDatas: Array<{
      hourStartUnix: number
      reserveUSD: string
      hourlyVolumeUSD: string
      reserve0: string
      reserve1: string
      totalSupply: string
      id: string
    }>
    pair: {
      token0: { symbol: string }
      token1: { symbol: string }
    }
  } = await request(
    ENDPOINT,
    query,
    { pair: pairAddress.toLowerCase(), first: limit },
    headers
  )

  // Handle cases where no hourly data is available
  if (!data.pairHourDatas || data.pairHourDatas.length === 0)
    throw new Error(`No hourly data found for pair ${pairAddress}`)

  // Extract token symbols once per pair
  const token0Symbol = data.pair.token0.symbol
  const token1Symbol = data.pair.token1.symbol

  // Transform GraphQL response into internal PairData format
  return data.pairHourDatas.map((d) => ({
    timestamp: new Date(d.hourStartUnix * 1000).toISOString(),
    reserveUSD: d.reserveUSD,
    volumeUSD: d.hourlyVolumeUSD,
    // Standard 0.3% DEX fee assumption (Uniswap-like)
    feesUSD: (parseFloat(d.hourlyVolumeUSD) * 0.003).toString(),
    token0Symbol,
    token1Symbol
  }))
}
