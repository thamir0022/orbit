import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { UploadSessionStatus } from '../enums/upload-session.enum'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'
import { FileId } from '../value-objects/file-id.vo'
import { FileSize } from '../value-objects/file-size.vo'
import { StorageObjectRef } from '../value-objects/storage-object-ref.vo'
import { UploadSessionId } from '../value-objects/upload-session-id.vo'
import { assertValidDate } from '../utils/file-domain-guards'

/** Persistent state of an upload session. */
export interface UploadSessionProps {
  readonly id: UploadSessionId
  readonly fileId: FileId
  readonly initiatedBy: UserId
  readonly stagingObject: StorageObjectRef
  readonly expectedSize: FileSize
  readonly status: UploadSessionStatus
  readonly createdAt: Date
  readonly expiresAt: Date
  readonly completedAt: Date | null
  readonly abortedAt: Date | null
}

/** A short-lived direct upload to private staging storage. */
export class UploadSession extends AggregateRoot<UploadSessionId> {
  private _status: UploadSessionStatus
  private _completedAt: Date | null
  private _abortedAt: Date | null
  private constructor(private readonly state: UploadSessionProps) {
    super(state.id)
    this._status = state.status
    this._completedAt = state.completedAt && new Date(state.completedAt)
    this._abortedAt = state.abortedAt && new Date(state.abortedAt)
    assertValidDate(state.createdAt, 'createdAt')
    assertValidDate(state.expiresAt, 'expiresAt')
    if (state.expiresAt <= state.createdAt || state.expectedSize.bytes <= 0) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Invalid upload window'
      )
    }
    if (!Object.values(UploadSessionStatus).includes(state.status)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Invalid upload status'
      )
    }
    if (
      (state.status === UploadSessionStatus.COMPLETED) !==
        Boolean(state.completedAt) ||
      (state.status === UploadSessionStatus.ABORTED) !==
        Boolean(state.abortedAt)
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Invalid upload timestamps'
      )
    }
  }

  static create(
    input: Omit<
      UploadSessionProps,
      'id' | 'status' | 'createdAt' | 'completedAt' | 'abortedAt'
    > & { now?: Date }
  ): UploadSession {
    const now = input.now ?? new Date()
    return new UploadSession({
      id: UploadSessionId.create(),
      fileId: input.fileId,
      initiatedBy: input.initiatedBy,
      stagingObject: input.stagingObject,
      expectedSize: input.expectedSize,
      status: UploadSessionStatus.INITIATED,
      createdAt: new Date(now),
      expiresAt: new Date(input.expiresAt),
      completedAt: null,
      abortedAt: null,
    })
  }

  static reconstitute(props: UploadSessionProps): UploadSession {
    return new UploadSession(props)
  }

  complete(now: Date = new Date()): void {
    this.assertInitiated()
    assertValidDate(now, 'now')
    if (now >= this.expiresAt)
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Upload expired'
      )
    this._completedAt = new Date(now)
    this._status = UploadSessionStatus.COMPLETED
  }

  expire(now: Date = new Date()): void {
    this.assertInitiated()
    assertValidDate(now, 'now')
    if (now < this.expiresAt)
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Upload is not expired'
      )
    this._status = UploadSessionStatus.EXPIRED
  }

  abort(now: Date = new Date()): void {
    this.assertInitiated()
    assertValidDate(now, 'now')
    this._status = UploadSessionStatus.ABORTED
    this._abortedAt = new Date(now)
  }

  private assertInitiated(): void {
    if (this._status !== UploadSessionStatus.INITIATED) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Upload session is not active'
      )
    }
  }

  get id(): UploadSessionId {
    return this._id
  }
  get fileId(): FileId {
    return this.state.fileId
  }
  get initiatedBy(): UserId {
    return this.state.initiatedBy
  }
  get stagingObject(): StorageObjectRef {
    return this.state.stagingObject
  }
  get expectedSize(): FileSize {
    return this.state.expectedSize
  }
  get status(): UploadSessionStatus {
    return this._status
  }
  get createdAt(): Date {
    return new Date(this.state.createdAt)
  }
  get expiresAt(): Date {
    return new Date(this.state.expiresAt)
  }
  get completedAt(): Date | null {
    return this._completedAt && new Date(this._completedAt)
  }
  get abortedAt(): Date | null {
    return this._abortedAt && new Date(this._abortedAt)
  }
}
