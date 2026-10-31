import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { AggregateRoot } from '@/shared/domain'
import { UuidUtil } from '@/shared/utils'
import { NotificationType } from '../enums/notification-type.enum'
import { NotificationValidationException } from '../exceptions/notification-validation.exception'
import type {
  CreateNotificationProps,
  NotificationProps,
} from '../interfaces/notification.interface'
import { NotificationMetadata } from '../value-objects/notification-metadata.vo'
import { NotificationId } from '../value-objects/notification-id.vo'
import { NotificationResource } from '../value-objects/notification-resource.vo'

const DEFAULT_RETENTION_DAYS = 90
const MAX_TITLE_LENGTH = 160
const MAX_MESSAGE_LENGTH = 10_000

/**
 * Aggregate root representing one recipient's persistent inbox notification.
 *
 * Responsibilities:
 * - Maintain a stable event/recipient identity for idempotent delivery.
 * - Validate content and optional rich metadata.
 * - Own read/unread transitions and retention policy.
 * - Reference application resources by stable UUID, not route or slug.
 *
 * A notification is not a security audit record. The application layer
 * validates recipient eligibility and orchestrates realtime delivery.
 */
export class Notification extends AggregateRoot<NotificationId> {
  private readonly _workspaceId: WorkspaceId | null
  private readonly _recipientId: UserId
  private readonly _actorId: UserId | null
  private readonly _eventId: string
  private readonly _type: NotificationType
  private readonly _title: string
  private readonly _message: string
  private readonly _resource: NotificationResource | null
  private readonly _metadata: NotificationMetadata | null
  private _readAt: Date | null
  private readonly _createdAt: Date
  private readonly _expiresAt: Date | null

  private constructor(props: NotificationProps) {
    super(props.id)

    this._workspaceId = props.workspaceId
    this._recipientId = props.recipientId
    this._actorId = props.actorId
    this._eventId = Notification.validateEventId(props.eventId)
    this._type = Notification.validateType(props.type)
    this._title = Notification.normalizeText(
      props.title,
      MAX_TITLE_LENGTH,
      'Title'
    )
    this._message = Notification.normalizeText(
      props.message,
      MAX_MESSAGE_LENGTH,
      'Message'
    )
    this._resource = props.resource
    this._metadata = props.metadata
    this._createdAt = Notification.copyDate(props.createdAt, 'Created at')
    this._readAt = props.readAt
      ? Notification.copyDate(props.readAt, 'Read at')
      : null
    this._expiresAt = props.expiresAt
      ? Notification.copyDate(props.expiresAt, 'Expires at')
      : null

    if (this._readAt && this._readAt < this._createdAt) {
      throw new NotificationValidationException(
        'Read time cannot precede creation'
      )
    }

    if (this._expiresAt && this._expiresAt <= this._createdAt) {
      throw new NotificationValidationException('Expiry must follow creation')
    }
  }

  /** Creates a new unread notification for one recipient. */
  static create(props: CreateNotificationProps): Notification {
    const now = new Date()

    const expiresAt =
      props.expiresAt !== undefined
        ? props.expiresAt
        : props.type === NotificationType.SYSTEM_WELCOME
          ? null
          : new Date(now.getTime() + DEFAULT_RETENTION_DAYS * 86_400_000)

    return new Notification({
      id: NotificationId.create(),
      workspaceId: props.workspaceId
        ? WorkspaceId.create(props.workspaceId)
        : null,
      recipientId: UserId.create(props.recipientId),
      actorId: props.actorId ? UserId.create(props.actorId) : null,
      eventId: props.eventId,
      type: props.type,
      title: props.title,
      message: props.message,
      resource: props.resource
        ? NotificationResource.create(props.resource)
        : null,
      metadata: props.metadata
        ? NotificationMetadata.create(props.metadata)
        : null,
      readAt: null,
      createdAt: now,
      expiresAt,
    })
  }

  /** Reconstitutes a previously persisted notification. */
  static reconstitute(props: NotificationProps): Notification {
    return new Notification(props)
  }

  /** Marks a notification as read; returns false when already read. */
  markRead(at: Date = new Date()): boolean {
    if (this._readAt) return false

    const value = Notification.copyDate(at, 'Read at')

    if (value < this._createdAt) {
      throw new NotificationValidationException(
        'Read time cannot precede creation'
      )
    }

    this._readAt = value
    return true
  }

  /** Restores the unread state; returns false when already unread. */
  markUnread(): boolean {
    if (this._readAt === null) return false

    this._readAt = null
    return true
  }

  /** Returns whether the notification has reached its retention deadline. */
  isExpired(at: Date = new Date()): boolean {
    return this._expiresAt !== null && this._expiresAt <= at
  }

  /** Validates source event identity used for de-duplication. */
  private static validateEventId(value: string): string {
    if (!UuidUtil.isValid(value)) {
      throw new NotificationValidationException('Invalid notification event ID')
    }

    return value
  }

  /** Validates the closed set of supported notification types. */
  private static validateType(value: NotificationType): NotificationType {
    if (!Object.values(NotificationType).includes(value)) {
      throw new NotificationValidationException('Invalid notification type')
    }

    return value
  }

  /** Normalizes textual content while retaining Markdown line breaks. */
  private static normalizeText(
    value: string,
    max: number,
    field: string
  ): string {
    if (typeof value !== 'string') {
      throw new NotificationValidationException(`${field} must be text`)
    }

    const text = value.normalize('NFKC').trim()

    if (!text || text.length > max) {
      throw new NotificationValidationException(
        `${field} must be between 1 and ${max} characters`
      )
    }

    return text
  }

  /** Validates dates without keeping mutable external references. */
  private static copyDate(value: Date, field: string): Date {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new NotificationValidationException(`${field} must be a valid date`)
    }

    return new Date(value)
  }

  get id(): NotificationId {
    return this._id
  }
  get workspaceId(): WorkspaceId | null {
    return this._workspaceId
  }
  get recipientId(): UserId {
    return this._recipientId
  }
  get actorId(): UserId | null {
    return this._actorId
  }
  get eventId(): string {
    return this._eventId
  }
  get type(): NotificationType {
    return this._type
  }
  get title(): string {
    return this._title
  }
  get message(): string {
    return this._message
  }
  get resource(): NotificationResource | null {
    return this._resource
  }
  get metadata(): NotificationMetadata | null {
    return this._metadata
  }
  get readAt(): Date | null {
    return this._readAt ? new Date(this._readAt) : null
  }
  get createdAt(): Date {
    return new Date(this._createdAt)
  }
  get expiresAt(): Date | null {
    return this._expiresAt ? new Date(this._expiresAt) : null
  }
  get isRead(): boolean {
    return this._readAt !== null
  }
}
