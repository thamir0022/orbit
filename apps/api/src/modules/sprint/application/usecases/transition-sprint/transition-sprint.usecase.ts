import { Inject, Injectable } from '@nestjs/common'
import { TeamId } from '@/modules/team/domain'
import {
  TEAM_REPOSITORY,
  TeamRepository,
} from '@/modules/team/application/ports/team-repository.port'
import {
  TeamInactiveException,
  TeamNotFoundException,
} from '@/modules/team/domain/exceptions'
import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { SprintId } from '../../../domain/value-objects/sprint-id.vo'
import { SprintStatus } from '../../../domain/enums/sprint-status.enum'
import {
  SprintNotFoundException,
  SprintStartFailedException,
} from '../../../domain/exceptions'
import {
  SPRINT_REPOSITORY,
  SprintRepository,
} from '../../ports/sprint-repository.port'
import {
  SPRINT_QUERY_REPOSITORY,
  SprintQueryRepository,
} from '../../ports/sprint-query-repository.port'
import {
  ITransitionSprintUseCase,
  TransitionSprintInput,
} from './transition-sprint.interface'

@Injectable()
export class TransitionSprintUseCase implements ITransitionSprintUseCase {
  constructor(
    @Inject(SPRINT_REPOSITORY) private readonly sprints: SprintRepository,
    @Inject(SPRINT_QUERY_REPOSITORY)
    private readonly queries: SprintQueryRepository,
    @Inject(TEAM_REPOSITORY) private readonly teams: TeamRepository
  ) {}

  async execute(input: TransitionSprintInput) {
    const scope = {
      workspaceId: WorkspaceId.create(input.workspaceId),
      teamId: TeamId.create(input.teamId),
      sprintId: SprintId.create(input.sprintId),
    }
    const team = await this.teams.findByWorkspaceIdAndId(
      scope.workspaceId,
      scope.teamId
    )
    if (!team) throw new TeamNotFoundException()
    // Cancellation remains available for cleaning up archived teams.
    if (!team.isActive && input.action !== 'cancel')
      throw new TeamInactiveException()
    const sprint = await this.sprints.findByWorkspaceIdAndTeamIdAndId(scope)
    if (!sprint) throw new SprintNotFoundException()
    switch (input.action) {
      case 'start': {
        const active = await this.sprints.findByWorkspaceIdAndTeamIdAndStatus({
          workspaceId: scope.workspaceId,
          teamId: scope.teamId,
          status: SprintStatus.ACTIVE,
        })
        if (active)
          throw new SprintStartFailedException(
            'The team already has an active sprint.'
          )
        sprint.start()
        break
      }
      case 'complete':
        sprint.complete()
        break
      case 'cancel':
        sprint.cancel(UserId.create(input.actorId))
        break
    }
    // The conditional write and unique index also protect concurrent requests.
    await this.sprints.update(sprint)
    const result = await this.queries.findByWorkspaceIdAndTeamIdAndId(scope)
    if (!result) throw new SprintNotFoundException()
    return { sprint: result }
  }
}
