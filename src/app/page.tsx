"use client"

import { AprChart } from "./components/molecules/AprChart"

export default function HomePage() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1>Sentora AMM Dashboard</h1>
      <AprChart />
    </main>
  )
}
