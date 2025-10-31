// fetchPairData(pairAddress) → fetches a single pair from The Graph.
// Calculates fees as 0.3% of volumeUSD.
// Returns a typed object with reserveUSD, volumeUSD, feesUSD, and token symbols.

import { request, gql } from "graphql-request"
import { ENDPOINT } from "@/app/constants"

export type PairData = {
  reserveUSD: string
  volumeUSD: string
  feesUSD: string
  token0: { symbol: string }
  token1: { symbol: string }
}

export async function fetchPairData(pairAddress: string): Promise<PairData> {
  const query = gql`
    query PairData($pair: ID!) {
      pair(id: $pair) {
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

  const data = await request(ENDPOINT, query, {
    pair: pairAddress.toLowerCase()
  })

  if (!data.pair) throw new Error(`Pair ${pairAddress} not found`)

  return {
    ...data.pair,
    feesUSD: (parseFloat(data.pair.volumeUSD) * 0.003).toString() // 0.3% Uniswap fee
  }
}
