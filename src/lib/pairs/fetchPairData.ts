// fetchPairData(pairAddress, limit) → fetches last `limit` hours of data from The Graph
// Calculates fees as 0.3% of volumeUSD
// Returns an array of typed objects with reserveUSD, volumeUSD, feesUSD, timestamp, and token symbols

import { request, gql } from "graphql-request"
import { ENDPOINT } from "@/app/constants"

export type PairData = {
  timestamp: string
  reserveUSD: string
  volumeUSD: string
  feesUSD: string
  token0: { symbol: string }
  token1: { symbol: string }
}

export type PairHourDataResponse = {
  hourStartUnix: number
  reserveUSD: string
  volumeUSD: string
  token0: { symbol: string }
  token1: { symbol: string }
}

export async function fetchPairData(
  pairAddress: string,
  limit: number = 48
): Promise<PairData[]> {
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
        volumeUSD
        token0 {
          symbol
        }
        token1 {
          symbol
        }
      }
    }
  `

  const data: { pairHourDatas: PairHourDataResponse[] } = await request(
    ENDPOINT,
    query,
    { pair: pairAddress.toLowerCase(), first: limit }
  )

  if (!data.pairHourDatas || data.pairHourDatas.length === 0)
    throw new Error(`No hourly data found for pair ${pairAddress}`)

  return data.pairHourDatas.map((d) => ({
    timestamp: new Date(d.hourStartUnix * 1000).toISOString(),
    reserveUSD: d.reserveUSD,
    volumeUSD: d.volumeUSD,
    feesUSD: (parseFloat(d.volumeUSD) * 0.003).toString(),
    token0: d.token0,
    token1: d.token1
  }))
}
