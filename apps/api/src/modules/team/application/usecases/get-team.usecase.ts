import { Inject, Injectable } from '@nestjs/common'
import { GetTeamInput, GetTeamOutput } from '../dtos'
import { IGetTeamUseCase } from './get-team.interface'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamNotFoundException } from '../../domain/exceptions'
import {
  TEAM_QUERY_REPOSITORY,
  TeamQueryRepository,
} from '../ports/team-query-repository.port'

@Injectable()
export class GetTeamUseCase implements IGetTeamUseCase {
  constructor(
    @Inject(TEAM_QUERY_REPOSITORY)
    private readonly teamQueryRepo: TeamQueryRepository
  ) {}

  async execute(input: GetTeamInput): Promise<GetTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)

    const team = await this.teamQueryRepo.findByWorkspaceIdAndId({
      workspaceId,
      teamId,
    })

    if (!team) throw new TeamNotFoundException()

    return {
      team,
    }
  }
}
