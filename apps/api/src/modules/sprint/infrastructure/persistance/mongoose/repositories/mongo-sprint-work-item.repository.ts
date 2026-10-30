import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Connection, Model } from 'mongoose'
import { UUID } from 'mongodb'
import { ITransactionOptions } from '@/shared/application'
import { SprintWorkItem } from '../../../../domain/entities/sprint-work-item.entity'
import { SprintItemSnapshot } from '../../../../domain/interfaces/sprint-snapshot.interface'
import {
  SprintScope,
  SprintWorkItemRepository,
} from '../../../../application/ports/sprint-work-item-repository.port'
import { SPRINT_WORK_ITEM_MODEL } from '../schemas/sprint-work-item.schema'
import { SprintConflictException } from '../../../../domain/exceptions/sprint-conflict.exception'
import { sprintUuid } from '../mappers/sprint-uuid'
import { SprintWorkItemProps } from '../../../../domain/interfaces/sprint-work-item.interface'

export class MongoSprintWorkItemRepository implements SprintWorkItemRepository {
  constructor(
    @InjectModel(SPRINT_WORK_ITEM_MODEL)
    private readonly model: Model<SprintWorkItemProps>,
    @InjectConnection() private readonly connection: Connection
  ) {}

  private toDomain(row: SprintWorkItemProps): SprintWorkItem {
    return SprintWorkItem.reconstitute({
      state: row.state,
      current: row.current,
      addedAt: row.addedAt,
      addedDuringActive: row.addedDuringActive,
      removedAt: row.removedAt,
      assignmentReason: row.assignmentReason ?? null,
      reason: row.reason,
      rolloverCount: row.rolloverCount,
      assignedSnapshot: row.assignedSnapshot,
      committedSnapshot: row.committedSnapshot,
      closedSnapshot: row.closedSnapshot,
      id: sprintUuid(row.id),
      workspaceId: sprintUuid(row.workspaceId),
      teamId: sprintUuid(row.teamId),
      sprintId: sprintUuid(row.sprintId),
      workItemId: sprintUuid(row.workItemId),
      addedBy: sprintUuid(row.addedBy),
      removedBy: row.removedBy ? sprintUuid(row.removedBy) : null,
      sourceSprintId: row.sourceSprintId
        ? sprintUuid(row.sourceSprintId)
        : null,
      targetSprintId: row.targetSprintId
        ? sprintUuid(row.targetSprintId)
        : null,
      previousAssignmentId: row.previousAssignmentId
        ? sprintUuid(row.previousAssignmentId)
        : null,
    })
  }

  // Paginate in MongoDB instead of loading the full assignment history.
  async findPage(scope: SprintScope, page: number, limit: number) {
    const filter = {
      workspaceId: scope.workspaceId,
      teamId: scope.teamId,
      sprintId: scope.sprintId,
    }
    const rows = await this.model
      .find(filter)
      .sort({ addedAt: 1, id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec()
    const total = await this.model.countDocuments(filter).exec()
    return { items: rows.map((row) => this.toDomain(row)), total }
  }

  async findBySprint(
    scope: SprintScope,
    options?: ITransactionOptions
  ): Promise<SprintWorkItem[]> {
    const rows = await this.model
      .find({
        workspaceId: scope.workspaceId,
        teamId: scope.teamId,
        sprintId: scope.sprintId,
      })
      .sort({ addedAt: 1, id: 1 })
      .session(options?.session ?? null)
      .lean()
      .exec()
    return rows.map((row) => this.toDomain(row))
  }

  async findCurrent(
    workspaceId: string,
    workItemId: string,
    options?: ITransactionOptions
  ): Promise<SprintWorkItem | null> {
    const row = await this.model
      .findOne({ workspaceId, workItemId, current: true })
      .session(options?.session ?? null)
      .lean()
      .exec()
    return row ? this.toDomain(row) : null
  }

  async findLatest(
    workspaceId: string,
    workItemId: string,
    options?: ITransactionOptions
  ): Promise<SprintWorkItem | null> {
    const row = await this.model
      .findOne({ workspaceId, workItemId })
      .sort({ addedAt: -1, id: -1 })
      .session(options?.session ?? null)
      .lean()
      .exec()
    return row ? this.toDomain(row) : null
  }

  // Read only the fields needed for scope decisions and immutable measurements.
  async readItems(
    workspaceId: string,
    teamId: string,
    ids: string[],
    options?: ITransactionOptions
  ): Promise<SprintItemSnapshot[]> {
    if (!ids.length) return []
    const rows = await this.connection
      .collection('work_items')
      .find(
        {
          workspaceId: new UUID(workspaceId),
          teamId: new UUID(teamId),
          id: { $in: ids.map((id) => new UUID(id)) },
        },
        {
          session: options?.session,
          projection: {
            id: 1,
            key: 1,
            title: 1,
            type: 1,
            status: 1,
            storyPoints: 1,
            deletedAt: 1,
          },
        }
      )
      .toArray()
    return rows.map((row) => ({
      id: sprintUuid(row.id),
      key: String(row.key),
      title: String(row.title),
      type: String(row.type),
      status: String(row.status),
      points: typeof row.storyPoints === 'number' ? row.storyPoints : null,
      deleted: row.deletedAt != null,
    }))
  }

  // Callers hold the sprint write lock inside the same transaction.
  async saveMany(
    items: SprintWorkItem[],
    options?: ITransactionOptions
  ): Promise<void> {
    if (!items.length) return
    try {
      await this.model.bulkWrite(
        items.map((item) => {
          const row = item.toSnapshot()
          return {
            updateOne: {
              filter: {
                id: row.id,
                workspaceId: row.workspaceId,
                teamId: row.teamId,
                sprintId: row.sprintId,
              },
              update: { $set: row },
              upsert: true,
            },
          }
        }),
        { session: options?.session, ordered: true }
      )
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000
      )
        throw new SprintConflictException(
          'The work item is already assigned to an open sprint.'
        )
      throw error
    }
  }
}
