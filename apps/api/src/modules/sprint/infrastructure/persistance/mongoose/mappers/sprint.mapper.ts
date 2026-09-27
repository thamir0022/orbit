import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'

import { Sprint } from '../../../../domain/entities/sprint.entity'
import { SprintId } from '../../../../domain/value-objects/sprint-id.vo'
import { SprintDocument } from '../schemas/sprint.schema'

/**
 * Maps between the Sprint domain aggregate and its
 * MongoDB persistence representation.
 *
 * Query/read models are intentionally not mapped here.
 * They belong to the dedicated query repository.
 */
export class SprintMapper {
  /**
   * Reconstitutes a Sprint aggregate from a persistence document.
   */
  static toDomain(document: SprintDocument): Sprint {
    return Sprint.reconstitute({
      id: SprintId.fromString(document.id),

      workspaceId: WorkspaceId.fromString(document.workspaceId),
      teamId: TeamId.fromString(document.teamId),

      name: document.name,
      goal: document.goal,
      description: document.description,

      startDate: document.startDate,
      endDate: document.endDate,

      status: document.status,

      committedPoints: document.committedPoints ?? null,
      completedPoints: document.completedPoints ?? null,

      createdBy: UserId.fromString(document.createdBy),

      startedAt: document.startedAt ?? null,
      completedAt: document.completedAt ?? null,

      cancelledAt: document.cancelledAt ?? null,
      cancelledBy: document.cancelledBy
        ? UserId.fromString(document.cancelledBy)
        : null,
    })
  }

  /**
   * Converts a Sprint aggregate into its persistence representation.
   *
   * createdAt and updatedAt are intentionally omitted because
   * they are managed by Mongoose timestamps.
   */
  static toPersistence(sprint: Sprint): Partial<SprintDocument> {
    return {
      id: sprint.id.value,

      workspaceId: sprint.workspaceId.value,
      teamId: sprint.teamId.value,

      name: sprint.name,
      goal: sprint.goal,
      description: sprint.description,

      startDate: sprint.startDate,
      endDate: sprint.endDate,

      status: sprint.status,

      committedPoints: sprint.committedPoints,
      completedPoints: sprint.completedPoints,

      createdBy: sprint.createdBy.value,

      startedAt: sprint.startedAt,
      completedAt: sprint.completedAt,

      cancelledAt: sprint.cancelledAt,
      cancelledBy: sprint.cancelledBy?.value ?? null,
    }
  }
}
