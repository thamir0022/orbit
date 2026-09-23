import { Inject, Injectable } from '@nestjs/common'
import { GetTeamsInput, GetTeamsOutput } from '../dtos'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { IGetTeamsUseCase } from './get-teams.interface'
import { WorkspaceRepository } from '@/modules/workspace/infrastructure/persistence/repository/workspace.repository'
import { WORKSPACE_REPOSITORY } from '@/modules/workspace/application'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import { TeamMapper } from '../mappers/team.mapper'

@Injectable()
export class GetTeamsUseCase implements IGetTeamsUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepo: TeamRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepo: WorkspaceRepository
  ) {}

  async execute(input: GetTeamsInput): Promise<GetTeamsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const workspace = await this.workspaceRepo.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const teams = await this.teamRepo.findByWorkspaceId(workspaceId)

    return {
      teams: teams.map((team) => TeamMapper.toOutputDto(team)),
    }
  }
}
