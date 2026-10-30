import { Binary } from 'mongodb'

/**
 * Normalizes UUIDs returned by lean MongoDB reads.
 *
 * - Mongoose UUID getters are bypassed by lean reads and aggregations.
 */
export function notificationUuid(value: unknown): string {
  if (value instanceof Binary) return value.toUUID().toString()
  if (typeof value === 'string') return value
  throw new TypeError('Invalid stored notification UUID')
}
