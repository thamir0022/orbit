import { Types } from 'mongoose'
import { RepositoryConflictError } from '@/modules/file/application/ports/repositories/repository-snapshot'

/** Reads canonical UUID strings from Mongoose UUID values. */
export function readUuid(value: unknown, field: string): string {
  if (typeof value === 'string') {
    return value
  }

  if (value instanceof Types.UUID) {
    const text = value.toString()

    if (/^[0-9a-f-]{36}$/i.test(text)) {
      return text
    }
  }

  throw new Error(`Invalid MongoDB UUID field: ${field}`)
}

/** Validates an aggregate's persisted revision. */
export function requireRevision(revision: number): number {
  if (!Number.isSafeInteger(revision) || revision < 0) {
    throw new Error('Invalid persisted revision')
  }

  return revision
}

/** Throws when an optimistic concurrency update finds no record. */
export function assertUpdated<T>(value: T | null): asserts value is T {
  if (value === null) {
    throw new RepositoryConflictError()
  }
}

/** Converts duplicate-key violations into repository conflicts. */
export function mapWriteError(error: unknown): never {
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 11000
  ) {
    throw new RepositoryConflictError(
      'A resource with this unique identity already exists'
    )
  }

  throw error
}

/** Restricts the maximum size of a repository query. */
export function boundedLimit(limit: number, max = 100): number {
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > max) {
    throw new RangeError(`limit must be between 1 and ${max}`)
  }

  return limit
}
