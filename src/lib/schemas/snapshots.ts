import { z } from "zod"

/**
 * Zod schema for validating and parsing query parameters for snapshot requests.
 *
 * This ensures that:
 * - `pair` is an optional string (filter by pair address)
 * - `limit` is converted to a number and defaults to 100 if missing
 * - `offset` is converted to a number and defaults to 0 if missing
 *
 * Usage:
 * ```ts
 * const { pair, limit, offset } = snapshotsQuerySchema.parse(req.query)
 * ```
 */
export const snapshotsQuerySchema = z.object({
  // Optional pair filter
  pair: z.string().optional(),

  // Optional limit, transformed from string to number, default 100
  limit: z
    .string()
    .transform((val) => Number(val))
    .optional()
    .default(100), // ensures numeric type

  // Optional offset, transformed from string to number, default 0
  offset: z
    .string()
    .transform((val) => Number(val))
    .optional()
    .default(0) // ensures numeric type
})
