import { AggregateRoot } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AttachmentPlacement } from '../enums/attachment.enum'
import {
  FileDomainErrorCode,
  FileDomainException,
} from '../exceptions/file-domain.exception'
import { AttachmentId } from '../value-objects/attachment-id.vo'
import { AttachmentTarget } from '../value-objects/attachment-target.vo'
import { FileId } from '../value-objects/file-id.vo'
import { assertValidDate } from '../utils/file-domain-guards'

/** Persisted attachment state used for reconstitution. */
export interface AttachmentProps {
  readonly id: AttachmentId
  readonly workspaceId: WorkspaceId
  readonly fileId: FileId
  readonly target: AttachmentTarget
  readonly placement: AttachmentPlacement
  readonly displayName: string | null
  readonly position: number
  readonly createdBy: UserId
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly deletedAt: Date | null
}

/** Required properties for creating an attachment. */
export interface CreateAttachmentProps {
  readonly workspaceId: WorkspaceId
  readonly fileId: FileId
  readonly target: AttachmentTarget
  readonly createdBy: UserId
  readonly placement?: AttachmentPlacement
  readonly displayName?: string | null
  readonly position?: number
  readonly now?: Date
}

/** Represents a workspace-scoped relationship between a file and a target. */
export class Attachment extends AggregateRoot<AttachmentId> {
  private readonly _workspaceId: WorkspaceId
  private readonly _fileId: FileId
  private readonly _target: AttachmentTarget
  private readonly _createdBy: UserId
  private _placement: AttachmentPlacement
  private _displayName: string | null
  private _position: number
  private readonly _createdAt: Date
  private _updatedAt: Date
  private _deletedAt: Date | null

  private constructor(props: AttachmentProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._fileId = props.fileId
    this._target = props.target
    this._createdBy = props.createdBy
    this._placement = Attachment.validatePlacement(props.placement)
    this._displayName = Attachment.normalizeDisplayName(props.displayName)
    this._position = Attachment.validatePosition(props.position)
    this._createdAt = new Date(props.createdAt)
    this._updatedAt = new Date(props.updatedAt)
    this._deletedAt = props.deletedAt ? new Date(props.deletedAt) : null

    assertValidDate(this._createdAt, 'createdAt')
    assertValidDate(this._updatedAt, 'updatedAt')

    if (this._deletedAt) {
      assertValidDate(this._deletedAt, 'deletedAt')
    }
  }

  static create(input: CreateAttachmentProps): Attachment {
    const now = input.now ?? new Date()
    assertValidDate(now, 'now')

    return new Attachment({
      id: AttachmentId.create(),
      workspaceId: input.workspaceId,
      fileId: input.fileId,
      target: input.target,
      createdBy: input.createdBy,
      placement: input.placement ?? AttachmentPlacement.ATTACHMENT,
      displayName: input.displayName ?? null,
      position: input.position ?? 0,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    })
  }

  static reconstitute(props: AttachmentProps): Attachment {
    return new Attachment(props)
  }

  /** Updates the attachment display name. */
  rename(displayName: string | null, now: Date = new Date()): void {
    this.ensureActive()

    const normalized = Attachment.normalizeDisplayName(displayName)

    if (normalized === this._displayName) return

    assertValidDate(now, 'now')
    this._displayName = normalized
    this.touch(now)
  }

  /** Updates the attachment position. */
  setPosition(position: number, now: Date = new Date()): void {
    this.ensureActive()

    const normalized = Attachment.validatePosition(position)

    if (normalized === this._position) return

    assertValidDate(now, 'now')
    this._position = normalized
    this.touch(now)
  }

  /** Soft-deletes the attachment without deleting the file. */
  remove(now: Date = new Date()): void {
    if (this._deletedAt) return

    assertValidDate(now, 'now')
    this._deletedAt = new Date(now)
    this.touch(now)
  }

  private ensureActive(): void {
    if (this._deletedAt) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Attachment is deleted'
      )
    }
  }

  private touch(now: Date): void {
    assertValidDate(now, 'now')
    this._updatedAt = new Date(now)
  }

  private static validatePlacement(
    placement: AttachmentPlacement
  ): AttachmentPlacement {
    if (!Object.values(AttachmentPlacement).includes(placement)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Invalid attachment placement'
      )
    }

    return placement
  }

  private static validatePosition(position: number): number {
    if (!Number.isSafeInteger(position) || position < 0) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_STATE,
        'Position must be a non-negative integer'
      )
    }

    return position
  }

  private static normalizeDisplayName(name: string | null): string | null {
    if (name === null) return null

    const normalized = name.normalize('NFKC').trim()

    if (!normalized || normalized.length > 255 || /\p{Cc}/u.test(normalized)) {
      throw new FileDomainException(
        FileDomainErrorCode.INVALID_NAME,
        'Invalid attachment display name'
      )
    }

    return normalized
  }

  get id(): AttachmentId {
    return this._id
  }

  get workspaceId(): WorkspaceId {
    return this._workspaceId
  }

  get fileId(): FileId {
    return this._fileId
  }

  get target(): AttachmentTarget {
    return this._target
  }

  get createdBy(): UserId {
    return this._createdBy
  }

  get placement(): AttachmentPlacement {
    return this._placement
  }

  get displayName(): string | null {
    return this._displayName
  }

  get position(): number {
    return this._position
  }

  get createdAt(): Date {
    return new Date(this._createdAt)
  }

  get updatedAt(): Date {
    return new Date(this._updatedAt)
  }

  get deletedAt(): Date | null {
    return this._deletedAt ? new Date(this._deletedAt) : null
  }
}
