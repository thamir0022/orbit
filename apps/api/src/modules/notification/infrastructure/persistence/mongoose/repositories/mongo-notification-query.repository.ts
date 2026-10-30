import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { UUID } from 'mongodb'
import type { Model, PipelineStage } from 'mongoose'

import type { UserId } from '@/modules/user/domain'
import type { ITransactionOptions } from '@/shared/application'
import type { UserSummaryOutput } from '@/shared/application/contracts/user-summary.output'
import { UuidUtil } from '@/shared/utils'

import type {
  NotificationListItemOutput,
  NotificationPageOutput,
} from '../../../../application/contracts/notification-list-item.output'
import type {
  FindNotificationsQuery,
  NotificationQueryRepository,
} from '../../../../application/ports/notification-query-repository.port'
import { buildNotificationResourceHref } from '../../../../application/utils/notification-resource-link'
import { NotificationValidationException } from '../../../../domain/exceptions/notification-validation.exception'
import { NotificationId } from '../../../../domain/value-objects/notification-id.vo'
import { notificationUuid } from '../mappers/notification-uuid'
import { NotificationModel } from '../schemas/notification.schema'

/** Fields used for stable, newest-first cursor pagination. */
interface NotificationCursor {
  readonly createdAt: string
  readonly id: string
}

/** Minimal user document returned by the actor lookup. */
interface NotificationActorRecord {
  readonly id: unknown
  readonly displayName?: string
  readonly avatarUrl?: string | null
}

/** MongoDB notification document enriched with an actor summary. */
interface NotificationReadRecord extends NotificationModel {
  readonly actorSummary?: NotificationActorRecord | null
}

/**
 * MongoDB query repository for the notification inbox.
 *
 * - Restricts notifications to the authenticated recipient.
 * - Supports workspace filtering and unread-only queries.
 * - Implements stable cursor-based pagination.
 * - Enriches actors using a single indexed MongoDB lookup.
 * - Maps persistence documents to application read models.
 */
@Injectable()
export class MongoNotificationQueryRepository implements NotificationQueryRepository {
  private static readonly USERS_COLLECTION = 'users'
  private static readonly DEFAULT_PAGE_SIZE = 20
  private static readonly MAX_PAGE_SIZE = 100
  private static readonly MAX_CURSOR_LENGTH = 512

  constructor(
    @InjectModel(NotificationModel.name)
    private readonly notificationModel: Model<NotificationModel>
  ) {}

  /**
   * Retrieves paginated notifications with enriched actor summaries.
   *
   * - Applies recipient, workspace, unread, and expiration filters.
   * - Uses createdAt and id for stable cursor pagination.
   * - Resolves actors after limiting the result set.
   */
  async findMany(
    query: FindNotificationsQuery,
    options?: ITransactionOptions
  ): Promise<NotificationPageOutput> {
    const limit = this.normalizeLimit(query.limit)
    const now = new Date()

    const filters: Record<string, unknown>[] = [
      { recipientId: new UUID(query.recipientId.value) },
      this.activeNotificationFilter(now),
    ]

    // Filter notifications by workspace when explicitly requested.
    if (query.workspaceId !== undefined) {
      filters.push({
        workspaceId: query.workspaceId
          ? new UUID(query.workspaceId.value)
          : null,
      })
    }

    // Include only unread notifications when requested.
    if (query.unreadOnly) {
      filters.push({ readAt: null })
    }

    // Apply the cursor using the same fields as the sort order.
    if (query.cursor) {
      const cursor = this.decodeCursor(query.cursor)
      const createdAt = new Date(cursor.createdAt)

      filters.push({
        $or: [
          { createdAt: { $lt: createdAt } },
          {
            createdAt,
            id: { $lt: new UUID(cursor.id) },
          },
        ],
      })
    }

    const pipeline: PipelineStage[] = [
      { $match: { $and: filters } },
      { $sort: { createdAt: -1, id: -1 } },
      { $limit: limit + 1 },
      ...this.actorLookupStages(),
    ]

    const documents = await this.notificationModel
      .aggregate<NotificationReadRecord>(pipeline)
      .session(options?.session ?? null)
      .exec()

    // The additional record determines whether another page exists.
    const hasNextPage = documents.length > limit
    const page = documents.slice(0, limit)
    const last = page.at(-1)

    return {
      items: page.map((document) => this.toReadModel(document)),
      hasNextPage,
      nextCursor:
        hasNextPage && last
          ? this.encodeCursor({
              createdAt: last.createdAt.toISOString(),
              id: notificationUuid(last.id),
            })
          : null,
    }
  }

  /**
   * Finds a notification belonging to the specified recipient.
   *
   * - Excludes expired notifications.
   * - Enriches the actor using the shared user summary fields.
   */
  async findByIdAndRecipientId(
    id: NotificationId,
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<NotificationListItemOutput | null> {
    const pipeline: PipelineStage[] = [
      {
        $match: {
          id: new UUID(id.value),
          recipientId: new UUID(recipientId.value),
          ...this.activeNotificationFilter(new Date()),
        },
      },
      { $limit: 1 },
      ...this.actorLookupStages(),
    ]

    const documents = await this.notificationModel
      .aggregate<NotificationReadRecord>(pipeline)
      .session(options?.session ?? null)
      .exec()

    const document = documents[0]

    return document ? this.toReadModel(document) : null
  }

  /**
   * Counts unread, non-expired notifications for a recipient.
   *
   * - Uses the recipient and read-state index.
   * - Avoids loading notification documents.
   */
  async countUnread(
    recipientId: UserId,
    options?: ITransactionOptions
  ): Promise<number> {
    return this.notificationModel
      .countDocuments({
        recipientId: recipientId.value,
        readAt: null,
        ...this.activeNotificationFilter(new Date()),
      })
      .session(options?.session ?? null)
      .exec()
  }

  /**
   * Creates an aggregation lookup for lightweight actor enrichment.
   *
   * - Joins notifications.actorId with users.id.
   * - Projects only fields required by UserSummaryOutput.
   * - Preserves notifications without an actor.
   */
  private actorLookupStages(): PipelineStage[] {
    return [
      {
        $lookup: {
          from: MongoNotificationQueryRepository.USERS_COLLECTION,
          localField: 'actorId',
          foreignField: 'id',
          pipeline: [
            {
              $project: {
                _id: 0,
                id: 1,
                displayName: 1,
                avatarUrl: 1,
              },
            },
          ],
          as: 'actorMatches',
        },
      },
      {
        $set: {
          actorSummary: {
            $ifNull: [{ $arrayElemAt: ['$actorMatches', 0] }, null],
          },
        },
      },
      {
        $project: {
          actorMatches: 0,
        },
      },
    ]
  }

  /**
   * Maps a notification document to its application read model.
   *
   * - Converts BSON UUID fields to strings.
   * - Enriches the actor using UserSummaryOutput.
   * - Generates permanent resource navigation links.
   */
  private toReadModel(
    document: NotificationReadRecord
  ): NotificationListItemOutput {
    const resource =
      document.resourceType && document.resourceId
        ? {
            type: document.resourceType,
            id: notificationUuid(document.resourceId),
            ...(document.resourceLabel
              ? { label: document.resourceLabel }
              : {}),
          }
        : null

    return {
      id: notificationUuid(document.id),
      workspaceId: document.workspaceId
        ? notificationUuid(document.workspaceId)
        : null,
      recipientId: notificationUuid(document.recipientId),
      actor: this.toActorSummary(document.actorSummary),
      type: document.type,
      title: document.title,
      message: document.message,
      resource: resource
        ? {
            ...resource,
            href: buildNotificationResourceHref(resource),
          }
        : null,
      metadata: document.metadata ?? null,
      readAt: document.readAt ?? null,
      createdAt: document.createdAt,
    }
  }

  /**
   * Converts the MongoDB actor projection to the shared user summary.
   *
   * - Returns null for system notifications or missing users.
   * - Exposes only the fields required by the client.
   */
  private toActorSummary(
    actor: NotificationActorRecord | null | undefined
  ): UserSummaryOutput | null {
    if (!actor?.id || typeof actor.displayName !== 'string') {
      return null
    }

    return {
      id: notificationUuid(actor.id),
      displayName: actor.displayName,
      avatarUrl: typeof actor.avatarUrl === 'string' ? actor.avatarUrl : null,
    }
  }

  /** Returns a filter excluding notifications past their expiration date. */
  private activeNotificationFilter(now: Date): Record<string, unknown> {
    return {
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }
  }

  /** Normalizes the requested page size within supported limits. */
  private normalizeLimit(limit: number): number {
    if (!Number.isFinite(limit)) {
      return MongoNotificationQueryRepository.DEFAULT_PAGE_SIZE
    }

    return Math.min(
      Math.max(1, Math.trunc(limit)),
      MongoNotificationQueryRepository.MAX_PAGE_SIZE
    )
  }

  /** Encodes pagination state into an opaque URL-safe cursor. */
  private encodeCursor(cursor: NotificationCursor): string {
    return Buffer.from(JSON.stringify(cursor), 'utf8').toString('base64url')
  }

  /**
   * Decodes and validates a pagination cursor.
   *
   * - Rejects malformed or oversized input.
   * - Validates the UUID and canonical ISO timestamp.
   * - Prevents invalid values from reaching MongoDB filters.
   */
  private decodeCursor(encoded: string): NotificationCursor {
    try {
      if (
        encoded.length === 0 ||
        encoded.length > MongoNotificationQueryRepository.MAX_CURSOR_LENGTH ||
        !/^[A-Za-z0-9_-]+$/.test(encoded)
      ) {
        throw new Error('Invalid cursor encoding')
      }

      const parsed: unknown = JSON.parse(
        Buffer.from(encoded, 'base64url').toString('utf8')
      )

      if (
        typeof parsed !== 'object' ||
        parsed === null ||
        !('id' in parsed) ||
        !('createdAt' in parsed)
      ) {
        throw new Error('Missing cursor fields')
      }

      const { id, createdAt } = parsed

      if (
        typeof id !== 'string' ||
        !UuidUtil.isValid(id) ||
        typeof createdAt !== 'string'
      ) {
        throw new Error('Invalid cursor fields')
      }

      const date = new Date(createdAt)

      if (Number.isNaN(date.getTime()) || date.toISOString() !== createdAt) {
        throw new Error('Invalid cursor timestamp')
      }

      return { id, createdAt }
    } catch {
      throw new NotificationValidationException(
        'Invalid notification pagination cursor'
      )
    }
  }
}
