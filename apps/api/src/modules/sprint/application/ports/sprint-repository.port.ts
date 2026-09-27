import { IBaseRepository, ITransactionOptions } from '@/shared/application'

import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'

import { SprintStatus } from '../../domain/enums/sprint-status.enum'
import { Sprint } from '../../domain/entities/sprint.entity'
import { SprintId } from '../../domain/value-objects/sprint-id.vo'

/**
 * Identifies a sprint within a specific workspace and team.
 */
export interface FindSprintByWorkspaceIdAndTeamIdAndIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  sprintId: SprintId
}

/**
 * Identifies a sprint by its workspace, team, and lifecycle status.
 */
export interface FindSprintByWorkspaceIdAndTeamIdAndStatusProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  status: SprintStatus
}

/**
 * Repository port for the Sprint aggregate.
 *
 * Provides persistence operations required by the application
 * layer without exposing infrastructure concerns.
 */
export interface SprintRepository extends IBaseRepository<Sprint, SprintId> {
  /**
   * Returns all sprints belonging to a team.
   */
  findByWorkspaceIdAndTeamId(
    workspaceId: WorkspaceId,
    teamId: TeamId,
    options?: ITransactionOptions
  ): Promise<Sprint[]>

  /**
   * Returns a specific sprint within a workspace and team.
   */
  findByWorkspaceIdAndTeamIdAndId(
    props: FindSprintByWorkspaceIdAndTeamIdAndIdProps,
    options?: ITransactionOptions
  ): Promise<Sprint | null>

  /**
   * Returns a sprint matching the given lifecycle status.
   *
   * Typically used for rules such as ensuring a team has
   * only one active sprint at a time.
   */
  findByWorkspaceIdAndTeamIdAndStatus(
    props: FindSprintByWorkspaceIdAndTeamIdAndStatusProps,
    options?: ITransactionOptions
  ): Promise<Sprint | null>
}

export const SPRINT_REPOSITORY = Symbol('ISprintRepository')
