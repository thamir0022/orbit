import { Binary } from 'mongodb'

// Lean reads and aggregations return BSON UUIDs without Mongoose getters.
export function sprintUuid(value: unknown): string {
  if (value instanceof Binary) return value.toUUID().toString()
  if (typeof value === 'string') return value
  throw new TypeError('Invalid stored sprint UUID')
}
