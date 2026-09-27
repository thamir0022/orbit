import { Inject, Injectable } from '@nestjs/common'
import { ICreateSprintUseCase } from './create-sprint.interface'
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import {
  TEAM_REPOSITORY,
  TeamRepository,
} from '@/modules/team/application/ports/team-repository.port'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../../ports/sprint-repository.port'
import {
  SPRINT_QUERY_REPOSITORY,
  SprintQueryRepository,
} from '../../ports/sprint-query-repository.port'
import { ITransactionManager, TRANSACTION_MANAGER } from '@/shared/application'
import { CreateSprintInput } from './create-sprint.input'
import { CreateSprintOutput } from './create-sprint.output'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { TeamId } from '@/modules/team/domain'
import { UserId } from '@/modules/user/domain'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  TeamInactiveException,
  TeamNotFoundException,
} from '@/modules/team/domain/exceptions'
import { Sprint } from '../../../domain/entities/sprint.entity'
import { SprintNotFoundException } from '@/modules/sprint/domain/exceptions'

/**
 * Creates a new sprint for a team.
 *
 * The use case is responsible for orchestration and application-level
 * validation. Domain invariants remain encapsulated by the Sprint aggregate.
 */
@Injectable()
export class CreateSprintUseCase implements ICreateSprintUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,

    @Inject(SPRINT_REPOSITORY)
    private readonly sprintRepository: SprintRepository,

    @Inject(SPRINT_QUERY_REPOSITORY)
    private readonly sprintQueryRepository: SprintQueryRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: CreateSprintInput): Promise<CreateSprintOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)
    const actorId = UserId.create(input.actorId)

    /**
     * Validate workspace state before creating the sprint.
     */
    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) {
      throw new WorkspaceNotFoundException()
    }

    if (workspace.status !== WorkspaceStatus.ACTIVE) {
      throw new WorkspaceNotActiveException(workspace.status)
    }

    /**
     * Resolve the team through a workspace-scoped lookup.
     *
     * This guarantees that the requested team belongs to
     * the current workspace.
     */
    const team = await this.teamRepository.findByWorkspaceIdAndId({
      workspaceId,
      teamId,
    })

    if (!team) {
      throw new TeamNotFoundException()
    }

    /**
     * Archived teams cannot receive new sprints.
     */
    if (!team.isActive) {
      throw new TeamInactiveException()
    }

    /**
     * Create and persist the sprint atomically.
     *
     * All sprint business invariants are enforced by Sprint.create().
     */
    const sprint = await this.transactionManager.executeTransaction(
      async (session) => {
        const newSprint = Sprint.create({
          workspaceId: workspaceId.value,
          teamId: teamId.value,
          name: input.name,
          goal: input.goal,
          description: input.description,
          startDate: input.startDate,
          endDate: input.endDate,
          createdBy: actorId.value,
        })

        await this.sprintRepository.save(newSprint, {
          session,
        })

        return newSprint
      }
    )

    /**
     * Read the committed sprint through the optimized query repository.
     *
     * The query-side projection provides the enriched client-facing
     * representation without reusing the aggregate for read concerns.
     */
    const result =
      await this.sprintQueryRepository.findByWorkspaceIdAndTeamIdAndId({
        workspaceId,
        teamId: sprint.teamId,
        sprintId: sprint.id,
      })

    if (!result) {
      throw new SprintNotFoundException()
    }

    return { sprint: result }
  }
}
