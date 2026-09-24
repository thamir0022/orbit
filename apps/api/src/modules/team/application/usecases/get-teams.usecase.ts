import { Inject, Injectable } from '@nestjs/common'
import { GetTeamsInput, GetTeamsOutput } from '../dtos'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { IGetTeamsUseCase } from './get-teams.interface'
import { WorkspaceRepository } from '@/modules/workspace/infrastructure/persistence/repository/workspace.repository'
import { WORKSPACE_REPOSITORY } from '@/modules/workspace/application'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  TEAM_QUERY_REPOSITORY,
  TeamQueryRepository,
} from '../ports/team-query-repository.port'

@Injectable()
export class GetTeamsUseCase implements IGetTeamsUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepo: WorkspaceRepository,
    @Inject(TEAM_QUERY_REPOSITORY)
    private readonly teamQueryRepo: TeamQueryRepository
  ) {}

  async execute(input: GetTeamsInput): Promise<GetTeamsOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const workspace = await this.workspaceRepo.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const teams = await this.teamQueryRepo.findByWorkspaceId(workspaceId)

    return {
      teams,
    }
  }
}
