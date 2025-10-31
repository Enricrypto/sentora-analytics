export const ENDPOINT = `https://gateway.thegraph.com/api/${process.env.THEGRAPH_API_KEY}/subgraphs/id/A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum`

export const PAIRS = [
  { label: "Pair 1", value: "0xbc9d21652cca70f54351e3fb982c6b5dbe992a22" },
  { label: "Pair 2", value: "0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc" }
]

// Config: past hours to fetch on first run
export const INITIAL_FETCH_HOURS = 48

// How often to fetch after first run
export const SNAPSHOT_INTERVAL_MINUTES = 60
