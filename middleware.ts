import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Security headers (like Helmet)
  res.headers.set("X-DNS-Prefetch-Control", "off")
  res.headers.set("X-Frame-Options", "SAMEORIGIN")
  res.headers.set("X-Content-Type-Options", "nosniff")
  res.headers.set("Referrer-Policy", "no-referrer")
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  )
  res.headers.set("Permissions-Policy", "geolocation=(), microphone=()")

  // Global CORS (allow all origins; adjust for prod)
  res.headers.set("Access-Control-Allow-Origin", "*")
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")

  return res
}

// Apply middleware to all API routes
export const config = {
  matcher: "/api/:path*"
}
