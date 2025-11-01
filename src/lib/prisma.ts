import { PrismaClient } from "@prisma/client"

/**
 * Singleton Prisma client instance.
 *
 * This ensures that only one PrismaClient is created in development,
 * preventing multiple instances from exhausting database connections
 * when using hot-reloading (e.g., with Next.js).
 *
 * Logs only errors to reduce console noise.
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error"]
  })

// In development, preserve the Prisma instance across hot reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
