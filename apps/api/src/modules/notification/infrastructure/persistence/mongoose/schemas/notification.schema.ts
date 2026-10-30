import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose'
import { NotificationResourceType } from '../../../../domain/enums/notification-resource-type.enum'
import { NotificationType } from '../../../../domain/enums/notification-type.enum'
import type { NotificationMetadataProps } from '../../../../domain/interfaces/notification-metadata.interface'

/** Hydrated Mongoose representation of a notification. */
export type NotificationDocument = HydratedDocument<NotificationModel>

/**
 * MongoDB model for a recipient's persistent inbox notification.
 *
 * - UUID fields use BSON UUID, consistent with Orbit's existing schemas.
 * - TTL is based on expiresAt, allowing non-expiring welcome messages.
 */
@Schema({
  collection: 'notifications',
  timestamps: { createdAt: true, updatedAt: false },
})
export class NotificationModel {
  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    unique: true,
  })
  id!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
    immutable: true,
    ref: 'WorkspaceModel',
  })
  workspaceId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
    ref: 'UserModel',
  })
  recipientId!: string

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
    immutable: true,
    ref: 'UserModel',
  })
  actorId!: string | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    required: true,
    immutable: true,
  })
  eventId!: string

  @Prop({
    type: String,
    required: true,
    immutable: true,
    enum: Object.values(NotificationType),
  })
  type!: NotificationType

  @Prop({
    type: String,
    required: true,
    maxlength: 160,
    immutable: true,
  })
  title!: string

  @Prop({
    type: String,
    required: true,
    maxlength: 10_000,
    immutable: true,
  })
  message!: string

  @Prop({
    type: String,
    enum: Object.values(NotificationResourceType),
    default: null,
    immutable: true,
  })
  resourceType!: NotificationResourceType | null

  @Prop({
    type: MongooseSchema.Types.UUID,
    default: null,
    immutable: true,
  })
  resourceId!: string | null

  @Prop({
    type: String,
    default: null,
    maxlength: 160,
    immutable: true,
  })
  resourceLabel!: string | null

  @Prop({
    type: MongooseSchema.Types.Mixed,
    default: null,
    immutable: true,
  })
  metadata!: NotificationMetadataProps | null

  @Prop({ type: Date, default: null })
  readAt!: Date | null

  // Managed by the Mongoose timestamp option.
  createdAt!: Date

  @Prop({
    type: Date,
    default: null,
    immutable: true,
  })
  expiresAt!: Date | null
}

/** Mongoose schema with inbox, idempotency, and retention indexes. */
export const NotificationSchema =
  SchemaFactory.createForClass(NotificationModel)

// One recipient receives at most one notification for a source event.
NotificationSchema.index(
  { eventId: 1, recipientId: 1 },
  { name: 'event_recipient_unique', unique: true }
)

// Stable, newest-first inbox pagination.
NotificationSchema.index(
  { recipientId: 1, createdAt: -1, id: -1 },
  { name: 'recipient_created_id' }
)

// Fast unread inbox filtering and unread counts.
NotificationSchema.index(
  { recipientId: 1, readAt: 1, createdAt: -1, id: -1 },
  { name: 'recipient_read_created_id' }
)

// Optional workspace-scoped inbox filtering.
NotificationSchema.index(
  { recipientId: 1, workspaceId: 1, createdAt: -1, id: -1 },
  { name: 'recipient_workspace_created_id' }
)

// Expiration is optional; MongoDB skips documents without a Date value.
NotificationSchema.index(
  { expiresAt: 1 },
  { name: 'notification_expiration_ttl', expireAfterSeconds: 0 }
)
