import { Inject, Injectable } from '@nestjs/common'
import { IDeleteTeamUseCase } from './delete-team.interface'
import { DeleteTeamInput } from '../dtos'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import { TeamNotFoundException } from '../../domain/exceptions'

@Injectable()
export class DeleteTeamUseCase implements IDeleteTeamUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepo: IWorkspaceRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepo: TeamRepository
  ) {}

  async execute(input: DeleteTeamInput): Promise<void> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)
    const userId = UserId.create(input.userId)

    const workspace = await this.workspaceRepo.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const team = await this.teamRepo.findByWorkspaceIdAndId({
      workspaceId,
      teamId,
    })

    if (!team) throw new TeamNotFoundException()

    team.delete(userId)

    await this.teamRepo.save(team)
  }
}
