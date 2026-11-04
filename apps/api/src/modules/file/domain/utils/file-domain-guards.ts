import { validate, version } from 'uuid'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'

/** Ensures identifiers respect Orbit's UUIDv7 convention. */
export function assertUuidV7(value: string, field: string): void {
  if (!validate(value) || version(value) !== 7) {
    throw new FileDomainException(
      FileDomainErrorCode.INVALID_ID,
      `${field} must be a valid UUIDv7`
    )
  }
}

/** Validates caller-supplied dates without mutating them. */
export function assertValidDate(value: Date, field: string): void {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new FileDomainException(
      FileDomainErrorCode.INVALID_DATE,
      `${field} must be a valid Date`
    )
  }
}

/** Validates a safe, positive-or-zero byte count. */
export function assertBytes(value: number, field: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new FileDomainException(
      FileDomainErrorCode.INVALID_SIZE,
      `${field} must be a non-negative safe integer`
    )
  }
}
