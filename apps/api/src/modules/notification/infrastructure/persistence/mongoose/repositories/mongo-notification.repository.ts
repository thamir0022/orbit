import { InjectModel } from '@nestjs/mongoose'
import { Injectable } from '@nestjs/common'
import type { Model } from 'mongoose'
import type { ITransactionOptions } from '@/shared/application'
import type { UserId } from '@/modules/user/domain'
import type { NotificationRepository } from '../../../../application/ports/notification-repository.port'
import { Notification } from '../../../../domain/entities/notification.entity'
import { NotificationId } from '../../../../domain/value-objects/notification-id.vo'
import { NotificationMapper } from '../mappers/notification.mapper'
import { NotificationModel } from '../schemas/notification.schema'

/**
 * MongoDB write adapter for the Notification aggregate.
 *
 * - Creates insert-only notifications with unique event/recipient identity.
 * - Performs ownership-scoped reads and conditional read-state updates.
 */
@Injectable()
export class MongoNotificationRepository implements NotificationRepository {
  constructor(
    @InjectModel(NotificationModel.name)
    private readonly notificationModel: Model<NotificationModel>
  ) {}

  /** Retrieves a notification belonging to the expected recipient. */
  async findByIdAndRecipientId(
    id: NotificationId,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<Notification | null> {
    const doc = await this.notificationModel
      .findOne({ id: id.value, recipientId: recipientId.value })
      .session(options?.session ?? null)
      .lean()
      .exec()
    return doc ? NotificationMapper.toDomain(doc) : null
  }

  /** Finds an existing delivery before attempting a new insert. */
  async findByEventIdAndRecipientId(
    eventId: string,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<Notification | null> {
    const doc = await this.notificationModel
      .findOne({ eventId, recipientId: recipientId.value })
      .session(options?.session ?? null)
      .lean()
      .exec()
    return doc ? NotificationMapper.toDomain(doc) : null
  }

  /** Inserts a new notification; MongoDB enforces idempotency uniqueness. */
  async save(
    notification: Notification,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.notificationModel.create(
      [NotificationMapper.toPersistence(notification)],
      {
        session: options?.session,
      }
    )
  }

  /** Persists only mutable read state, without replacing immutable notification content. */
  async update(
    notification: Notification,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.notificationModel
      .updateOne(
        {
          id: notification.id.value,
          recipientId: notification.recipientId.value,
        },
        { $set: { readAt: notification.readAt } },
        { session: options?.session, runValidators: true }
      )
      .exec()
  }

  /** Deletes only the record belonging to the authenticated recipient. */
  async deleteByIdAndRecipientId(
    id: NotificationId,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<void> {
    await this.notificationModel
      .deleteOne({ id: id.value, recipientId: recipientId.value })
      .session(options?.session ?? null)
      .exec()
  }
}
