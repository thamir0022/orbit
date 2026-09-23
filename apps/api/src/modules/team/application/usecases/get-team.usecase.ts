import { Inject, Injectable } from '@nestjs/common'
import { GetTeamInput, GetTeamOutput } from '../dtos'
import { IGetTeamUseCase } from './get-team.interface'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { TeamNotFoundException } from '../../domain/exceptions'
import { TeamMapper } from '../mappers/team.mapper'

@Injectable()
export class GetTeamUseCase implements IGetTeamUseCase {
  constructor(
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepo: TeamRepository
  ) {}

  async execute(input: GetTeamInput): Promise<GetTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)
    const teamId = TeamId.create(input.teamId)

    const team = await this.teamRepo.findByWorkspaceIdAndId({
      workspaceId,
      teamId,
    })

    if (!team) throw new TeamNotFoundException()

    return {
      team: TeamMapper.toOutputDto(team),
    }
  }
}
