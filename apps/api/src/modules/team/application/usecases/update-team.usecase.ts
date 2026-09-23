import { Inject, Injectable } from '@nestjs/common'
import { UpdateTeamInput, UpdateTeamOutput } from '../dtos'
import { IUpdateTeamUseCase } from './update-team.interface'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { WorkspaceRepository } from '@/modules/workspace/infrastructure/persistence/repository/workspace.repository'
import { WORKSPACE_REPOSITORY } from '@/modules/workspace/application'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  TeamAlreadyExistsException,
  TeamNotFoundException,
} from '../../domain/exceptions'
import { TeamMapper } from '../mappers/team.mapper'

@Injectable()
export class UpdateTeamUseCase implements IUpdateTeamUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepo: WorkspaceRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepo: TeamRepository
  ) {}

  async execute(input: UpdateTeamInput): Promise<UpdateTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const teamId = TeamId.create(input.teamId)

    const workspace = await this.workspaceRepo.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const team = await this.teamRepo.findByWorkspaceIdAndId({
      workspaceId,
      teamId,
    })

    if (!team) throw new TeamNotFoundException()

    if (input.name) {
      const teamWithSameName = await this.teamRepo.findByWorkspaceIdAndName({
        workspaceId,
        name: input.name,
      })

      if (teamWithSameName && !team.id.equals(teamWithSameName.id))
        throw new TeamAlreadyExistsException(input.name)
    }

    console.log('TEAM : ', team)

    team.updateTeam({
      name: input.name,
      description: input.description,
      avatarUrl: input.avatarUrl,
      leadId: input.leadId,
      status: input.status,
    })

    await this.teamRepo.save(team)

    return {
      team: TeamMapper.toOutputDto(team),
    }
  }
}
