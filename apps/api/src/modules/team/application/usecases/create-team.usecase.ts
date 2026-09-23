import { TeamRepository } from '../ports/team-repository.port'
import { WorkspaceId, WorkspaceStatus } from '@/modules/workspace/domain'
import { CreateTeamInput, CreateTeamOutput } from '../dtos'
import { ICreateTeamUseCase } from './create-team.interface'
import {
  IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import { Inject, Injectable } from '@nestjs/common'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import { Team } from '../../domain/entities/team.entity'
import { TEAM_REPOSITORY } from '../ports/team-repository.port'
import { TeamMapper } from '../mappers/team.mapper'
import { TeamAlreadyExistsException } from '../../domain/exceptions'

@Injectable()
export class CreateTeamUsecase implements ICreateTeamUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepo: IWorkspaceRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepo: TeamRepository
  ) {}

  async execute(input: CreateTeamInput): Promise<CreateTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const workspace = await this.workspaceRepo.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const existingTeam = await this.teamRepo.findByWorkspaceIdAndName({
      workspaceId,
      name: input.name,
    })

    if (existingTeam) throw new TeamAlreadyExistsException(existingTeam.name)

    const team = Team.create({
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      avatarUrl: input.avatarUrl,
      leadId: input.leadId,
      createdBy: input.createdBy,
    })

    await this.teamRepo.save(team)

    return {
      team: TeamMapper.toOutputDto(team),
    }
  }
}
