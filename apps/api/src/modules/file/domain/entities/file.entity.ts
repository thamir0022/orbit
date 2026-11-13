import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { FileMediaType, FileScanStatus, FileStatus } from '../enums/file.enum'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'
import { FileChecksum } from '../value-objects/file-checksum.vo'
import { FileId } from '../value-objects/file-id.vo'
import { FileMediaInfo } from '../value-objects/file-media-info.vo'
import { FileMimeType } from '../value-objects/file-mime-type.vo'
import { FileScope } from '../value-objects/file-scope.vo'
import { FileSize } from '../value-objects/file-size.vo'
import { StorageObjectRef } from '../value-objects/storage-object-ref.vo'
import { assertValidDate } from '../utils/file-domain-guards'

/** Persisted state used for file reconstitution. */
export interface FileProps {
  readonly id: FileId
  readonly scope: FileScope
  readonly createdBy: UserId
  readonly originalName: string
  readonly declaredMimeType: FileMimeType
  readonly expectedSize: FileSize
  readonly mimeType: FileMimeType | null
  readonly mediaType: FileMediaType | null
  readonly size: FileSize | null
  readonly checksum: FileChecksum | null
  readonly mediaInfo: FileMediaInfo | null
  readonly storageObject: StorageObjectRef | null
  readonly status: FileStatus
  readonly scanStatus: FileScanStatus
  readonly failureReason: string | null
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly uploadedAt: Date | null
  readonly readyAt: Date | null
  readonly deletedAt: Date | null
  readonly purgedAt?: Date | null
  readonly purgeAttemptedAt?: Date | null
}

/** Required properties for creating a pending file. */
export interface CreateFileProps {
  readonly scope: FileScope
  readonly createdBy: UserId
  readonly originalName: string
  readonly declaredMimeType: FileMimeType
  readonly expectedSize: FileSize
  readonly now?: Date
}

/** Verified metadata returned after inspecting uploaded content. */
export interface ConfirmFileUploadProps {
  readonly size: FileSize
  readonly mimeType: FileMimeType
  readonly mediaType: FileMediaType
  readonly checksum: FileChecksum
  readonly now?: Date
}

/** Manages the lifecycle of a private stored file. */
export class File extends AggregateRoot<FileId> {
  private readonly _scope: FileScope
  private readonly _createdBy: UserId
  private readonly _originalName: string
  private readonly _declaredMimeType: FileMimeType
  private readonly _expectedSize: FileSize
  private _mimeType: FileMimeType | null
  private _mediaType: FileMediaType | null
  private _size: FileSize | null
  private _checksum: FileChecksum | null
  private _mediaInfo: FileMediaInfo | null
  private _storageObject: StorageObjectRef | null
  private _status: FileStatus
  private _scanStatus: FileScanStatus
  private _failureReason: string | null
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _uploadedAt: Date | null
  private _readyAt: Date | null
  private _deletedAt: Date | null
  private _purgedAt: Date | null
  private _purgeAttemptedAt: Date | null

  private constructor(props: FileProps) {
    super(props.id)

    this._scope = props.scope
    this._createdBy = props.createdBy
    this._originalName = File.normalizeName(props.originalName)
    this._declaredMimeType = props.declaredMimeType
    this._expectedSize = props.expectedSize
    this._mimeType = props.mimeType
    this._mediaType = props.mediaType
    this._size = props.size
    this._checksum = props.checksum
    this._mediaInfo = props.mediaInfo
    this._storageObject = props.storageObject
    this._status = props.status
    this._scanStatus = props.scanStatus
    this._failureReason = props.failureReason
    this._createdAt = new Date(props.createdAt)
    this._updatedAt = new Date(props.updatedAt)
    this._uploadedAt = props.uploadedAt ? new Date(props.uploadedAt) : null
    this._readyAt = props.readyAt ? new Date(props.readyAt) : null
    this._deletedAt = props.deletedAt ? new Date(props.deletedAt) : null
    this._purgedAt = props.purgedAt ? new Date(props.purgedAt) : null
    this._purgeAttemptedAt = props.purgeAttemptedAt
      ? new Date(props.purgeAttemptedAt)
      : null

    this.validatePersistedState()
  }

  static create(input: CreateFileProps): File {
    const now = input.now ?? new Date()
    assertValidDate(now, 'now')

    if (input.expectedSize.bytes === 0) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'An uploaded file cannot be empty'
      )
    }

    return new File({
      id: FileId.create(),
      scope: input.scope,
      createdBy: input.createdBy,
      originalName: input.originalName,
      declaredMimeType: input.declaredMimeType,
      expectedSize: input.expectedSize,
      mimeType: null,
      mediaType: null,
      size: null,
      checksum: null,
      mediaInfo: null,
      storageObject: null,
      status: FileStatus.PENDING_UPLOAD,
      scanStatus: FileScanStatus.PENDING,
      failureReason: null,
      createdAt: now,
      updatedAt: now,
      uploadedAt: null,
      readyAt: null,
      deletedAt: null,
    })
  }

  static reconstitute(props: FileProps): File {
    return new File(props)
  }

  /** Records independently verified upload metadata. */
  confirmUpload(input: ConfirmFileUploadProps): void {
    this.ensureStatus(FileStatus.PENDING_UPLOAD)

    if (input.size.bytes !== this._expectedSize.bytes) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Uploaded size does not match the reserved size'
      )
    }

    if (!Object.values(FileMediaType).includes(input.mediaType)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_MIME_TYPE,
        'Invalid verified media category'
      )
    }

    const now = input.now ?? new Date()
    assertValidDate(now, 'now')

    this._size = input.size
    this._mimeType = input.mimeType
    this._mediaType = input.mediaType
    this._checksum = input.checksum
    this._uploadedAt = new Date(now)
    this._status = FileStatus.UPLOADED
    this.touch(now)
  }

  /** Begins file processing and security scanning. */
  beginProcessing(now: Date = new Date()): void {
    this.ensureStatus(FileStatus.UPLOADED)
    assertValidDate(now, 'now')

    this._status = FileStatus.PROCESSING
    this.touch(now)
  }

  /** Records trusted media dimensions or duration. */
  setMediaInfo(mediaInfo: FileMediaInfo, now: Date = new Date()): void {
    this.ensureStatus(FileStatus.PROCESSING)
    assertValidDate(now, 'now')

    this._mediaInfo = mediaInfo
    this.touch(now)
  }

  /** Marks the file as successfully scanned. */
  markScanClean(now: Date = new Date()): void {
    this.ensureStatus(FileStatus.PROCESSING)
    assertValidDate(now, 'now')

    this._scanStatus = FileScanStatus.CLEAN
    this.touch(now)
  }

  /** Makes a verified and scanned file available. */
  markReady(storageObject: StorageObjectRef, now: Date = new Date()): void {
    this.ensureStatus(FileStatus.PROCESSING)
    assertValidDate(now, 'now')

    if (this._scanStatus !== FileScanStatus.CLEAN) {
      throw new FileDomainException(
        FileDomainErrorCode.SCAN_REQUIRED,
        'A file must pass security scanning before becoming ready'
      )
    }

    this._storageObject = storageObject
    this._status = FileStatus.READY
    this._readyAt = new Date(now)
    this.touch(now)
  }

  /** Rejects an unsafe or invalid upload. */
  reject(reason: string, infected = false, now: Date = new Date()): void {
    this.ensureMutableUpload()

    const normalized = File.normalizeReason(reason)
    assertValidDate(now, 'now')

    this._failureReason = normalized
    this._scanStatus = infected ? FileScanStatus.INFECTED : this._scanStatus
    this._status = FileStatus.REJECTED
    this.touch(now)
  }

  /** Records a terminal file processing failure. */
  fail(reason: string, scanFailed = false, now: Date = new Date()): void {
    this.ensureMutableUpload()
    assertValidDate(now, 'now')

    this._failureReason = File.normalizeReason(reason)
    this._scanStatus = scanFailed ? FileScanStatus.FAILED : this._scanStatus
    this._status = FileStatus.FAILED
    this.touch(now)
  }

  /** Soft-deletes the file without directly removing cloud objects. */
  delete(now: Date = new Date()): void {
    if (this._status === FileStatus.DELETED) return

    assertValidDate(now, 'now')

    this._status = FileStatus.DELETED
    this._deletedAt = new Date(now)
    this.touch(now)
  }

  /** Rotates a disposal candidate behind files not yet attempted. */
  recordPurgeAttempt(now: Date = new Date()): void {
    this.ensureStatus(FileStatus.DELETED)
    assertValidDate(now, 'now')
    this._purgeAttemptedAt = new Date(now)
    this.touch(now)
  }

  /** Records confirmed removal of stored bytes while retaining the audit record. */
  markPurged(now: Date = new Date()): void {
    this.ensureStatus(FileStatus.DELETED)
    if (this._purgedAt) return
    assertValidDate(now, 'now')
    this._purgedAt = new Date(now)
    this.touch(now)
  }

  private ensureStatus(expected: FileStatus): void {
    if (this._status !== expected) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        `Expected file status ${expected}; received ${this._status}`
      )
    }
  }

  private ensureMutableUpload(): void {
    if (
      this._status !== FileStatus.PENDING_UPLOAD &&
      this._status !== FileStatus.UPLOADED &&
      this._status !== FileStatus.PROCESSING
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Only pending or processing uploads can be rejected or failed'
      )
    }
  }

  private touch(now: Date): void {
    assertValidDate(now, 'now')
    this._updatedAt = new Date(now)
  }

  private static normalizeName(name: string): string {
    const normalized = name.normalize('NFKC').trim()

    if (
      normalized.length === 0 ||
      normalized.length > 255 ||
      normalized.includes('/') ||
      normalized.includes('\\') ||
      /\p{Cc}/u.test(normalized) ||
      normalized === '.' ||
      normalized === '..'
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_NAME,
        'Filename must be 1-255 characters without paths or control characters'
      )
    }

    return normalized
  }

  private static normalizeReason(reason: string): string {
    const normalized = reason.trim()

    if (!normalized || normalized.length > 500) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Failure reason must be between 1 and 500 characters'
      )
    }

    return normalized
  }

  private validatePersistedState(): void {
    for (const [field, date] of [
      ['createdAt', this._createdAt],
      ['updatedAt', this._updatedAt],
      ['uploadedAt', this._uploadedAt],
      ['readyAt', this._readyAt],
      ['deletedAt', this._deletedAt],
      ['purgedAt', this._purgedAt],
      ['purgeAttemptedAt', this._purgeAttemptedAt],
    ] as const) {
      if (date) {
        assertValidDate(date, field)
      }
    }

    if (this._expectedSize.bytes === 0) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Expected size must be positive'
      )
    }

    if (
      !Object.values(FileStatus).includes(this._status) ||
      !Object.values(FileScanStatus).includes(this._scanStatus)
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Invalid file lifecycle or scan status'
      )
    }

    if (
      this._mediaType !== null &&
      !Object.values(FileMediaType).includes(this._mediaType)
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_MIME_TYPE,
        'Invalid media category'
      )
    }

    if (
      this._status === FileStatus.PENDING_UPLOAD &&
      (this._size ||
        this._mimeType ||
        this._mediaType ||
        this._checksum ||
        this._storageObject ||
        this._uploadedAt ||
        this._readyAt ||
        this._mediaInfo)
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Pending file cannot have verified metadata'
      )
    }

    if (
      (this._deletedAt || this._purgedAt || this._purgeAttemptedAt) &&
      this._status !== FileStatus.DELETED
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Only a deleted file can have deletedAt'
      )
    }

    if (
      [FileStatus.UPLOADED, FileStatus.PROCESSING, FileStatus.READY].includes(
        this._status
      ) &&
      (!this._size ||
        !this._checksum ||
        !this._mimeType ||
        !this._mediaType ||
        !this._uploadedAt)
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Missing verified upload metadata'
      )
    }

    if (this._size && this._size.bytes !== this._expectedSize.bytes) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_SIZE,
        'Verified size does not match expected size'
      )
    }

    if (
      this._status === FileStatus.READY &&
      (this._scanStatus !== FileScanStatus.CLEAN ||
        !this._storageObject ||
        !this._size ||
        !this._checksum ||
        !this._mimeType ||
        !this._mediaType ||
        !this._readyAt)
    ) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Incomplete ready file state'
      )
    }

    if (this._status === FileStatus.DELETED && !this._deletedAt) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Deleted file requires deletedAt'
      )
    }
  }

  get id(): FileId {
    return this._id
  }

  get scope(): FileScope {
    return this._scope
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get originalName(): string {
    return this._originalName
  }

  get declaredMimeType(): FileMimeType {
    return this._declaredMimeType
  }

  get expectedSize(): FileSize {
    return this._expectedSize
  }

  get mimeType(): FileMimeType | null {
    return this._mimeType
  }

  get mediaType(): FileMediaType | null {
    return this._mediaType
  }

  get size(): FileSize | null {
    return this._size
  }

  get checksum(): FileChecksum | null {
    return this._checksum
  }

  get mediaInfo(): FileMediaInfo | null {
    return this._mediaInfo
  }

  get storageObject(): StorageObjectRef | null {
    return this._storageObject
  }

  get status(): FileStatus {
    return this._status
  }

  get scanStatus(): FileScanStatus {
    return this._scanStatus
  }

  get failureReason(): string | null {
    return this._failureReason
  }

  get createdAt(): Date {
    return new Date(this._createdAt)
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt)
  }

  get uploadedAt(): Date | null {
    return this._uploadedAt ? new Date(this._uploadedAt) : null
  }

  get readyAt(): Date | null {
    return this._readyAt ? new Date(this._readyAt) : null
  }

  get deletedAt(): Date | null {
    return this._deletedAt ? new Date(this._deletedAt) : null
  }

  get purgedAt(): Date | null {
    return this._purgedAt ? new Date(this._purgedAt) : null
  }

  get purgeAttemptedAt(): Date | null {
    return this._purgeAttemptedAt ? new Date(this._purgeAttemptedAt) : null
  }
}
