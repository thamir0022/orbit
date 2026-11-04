import { AggregateRoot } from '@/shared/domain'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'
import { FileScope } from '../value-objects/file-scope.vo'
import { FileSize } from '../value-objects/file-size.vo'
import { StorageUsageId } from '../value-objects/storage-usage-id.vo'
import { assertBytes, assertValidDate } from '../utils/file-domain-guards'

/** Snapshot of account or workspace quota accounting. */
export interface StorageUsageProps {
  readonly id: StorageUsageId
  readonly scope: FileScope
  readonly usedBytes: number
  readonly reservedBytes: number
  readonly updatedAt: Date
}

/** Tracks bytes already stored and bytes reserved for in-flight uploads. */
export class StorageUsage extends AggregateRoot<StorageUsageId> {
  private readonly _scope: FileScope
  private _usedBytes: number
  private _reservedBytes: number
  private _updatedAt: Date

  private constructor(props: StorageUsageProps) {
    super(props.id)
    this._scope = props.scope
    this._usedBytes = props.usedBytes
    this._reservedBytes = props.reservedBytes
    this._updatedAt = new Date(props.updatedAt)
    assertBytes(this._usedBytes, 'usedBytes')
    assertBytes(this._reservedBytes, 'reservedBytes')
    assertValidDate(this._updatedAt, 'updatedAt')
  }

  static create(scope: FileScope, now: Date = new Date()): StorageUsage {
    return new StorageUsage({
      id: StorageUsageId.create(),
      scope,
      usedBytes: 0,
      reservedBytes: 0,
      updatedAt: now,
    })
  }

  static reconstitute(props: StorageUsageProps): StorageUsage {
    return new StorageUsage(props)
  }

  /** Reserves space before issuing an upload grant. */
  reserve(size: FileSize, limit: FileSize, now: Date = new Date()): void {
    if (size.bytes === 0) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Reservation size must be positive'
      )
    }
    assertValidDate(now, 'now')
    const nextReserved = this._reservedBytes + size.bytes
    const projected = this._usedBytes + nextReserved
    if (!Number.isSafeInteger(projected) || projected > limit.bytes) {
      throw new FileDomainException(
        FileDomainErrorCode.QUOTA_EXCEEDED,
        'Storage quota exceeded'
      )
    }
    this._reservedBytes = nextReserved
    this.touch(now)
  }

  /** Converts the verified upload reservation into stored bytes. */
  commitReservation(
    reserved: FileSize,
    actual: FileSize,
    now: Date = new Date()
  ): void {
    if (
      reserved.bytes > this._reservedBytes ||
      actual.bytes > reserved.bytes ||
      actual.bytes === 0
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Invalid storage reservation conversion'
      )
    }
    const nextUsed = this._usedBytes + actual.bytes
    assertBytes(nextUsed, 'usedBytes')
    assertValidDate(now, 'now')
    this._reservedBytes -= reserved.bytes
    this._usedBytes = nextUsed
    this.touch(now)
  }

  /** Releases a reservation on cancellation, expiry, or rejection. */
  releaseReservation(size: FileSize, now: Date = new Date()): void {
    if (size.bytes > this._reservedBytes) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Insufficient reserved bytes'
      )
    }
    assertValidDate(now, 'now')
    this._reservedBytes -= size.bytes
    this.touch(now)
  }

  /** Decrements usage only after the application confirms physical cleanup. */
  releaseUsed(size: FileSize, now: Date = new Date()): void {
    if (size.bytes > this._usedBytes) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Insufficient stored bytes'
      )
    }
    assertValidDate(now, 'now')
    this._usedBytes -= size.bytes
    this.touch(now)
  }

  private touch(now: Date): void {
    assertValidDate(now, 'now')
    this._updatedAt = new Date(now)
  }

  get id(): StorageUsageId {
    return this._id
  }
  get scope(): FileScope {
    return this._scope
  }
  get usedBytes(): number {
    return this._usedBytes
  }
  get reservedBytes(): number {
    return this._reservedBytes
  }
  get updatedAt(): Date {
    return new Date(this._updatedAt)
  }
}
