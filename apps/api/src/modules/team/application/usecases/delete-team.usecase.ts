import { Inject, Injectable } from '@nestjs/common'
import { IDeleteTeamUseCase } from './delete-team.interface'
import { DeleteTeamInput } from '../dtos'
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
import { TeamKey } from '../../domain/value-objects/team-key.vo'

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
    const key = TeamKey.create(input.key)
    const userId = UserId.create(input.userId)

    const workspace = await this.workspaceRepo.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const team = await this.teamRepo.findByWorkspaceIdAndKey({
      workspaceId,
      key,
    })

    if (!team) throw new TeamNotFoundException()

    team.delete(userId)

    await this.teamRepo.save(team)
  }
}
