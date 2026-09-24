import { TeamRepository, TEAM_REPOSITORY } from '../ports/team-repository.port'
import {
  WorkspaceId,
  WorkspaceMemberStatus,
  WorkspaceStatus,
} from '@/modules/workspace/domain'
import { CreateTeamInput, CreateTeamOutput } from '../dtos'
import { ICreateTeamUseCase } from './create-team.interface'
import {
  IWorkspaceMemberRepository,
  IWorkspaceRepository,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import { Inject, Injectable } from '@nestjs/common'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import { Team } from '../../domain/entities/team.entity'
import {
  TeamAlreadyExistsException,
  TeamLeadNotActiveWorkspaceMemberException,
  TeamLeadNotWorkspaceMemberException,
  TeamNotFoundException,
} from '../../domain/exceptions'
import {
  TEAM_QUERY_REPOSITORY,
  TeamQueryRepository,
} from '../ports/team-query-repository.port'
import { UserId } from '@/modules/user/domain'

@Injectable()
export class CreateTeamUseCase implements ICreateTeamUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    @Inject(TEAM_REPOSITORY)
    private readonly teamRepository: TeamRepository,
    @Inject(TEAM_QUERY_REPOSITORY)
    private readonly teamQueryRepository: TeamQueryRepository
  ) {}

  async execute(input: CreateTeamInput): Promise<CreateTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const existingTeam = await this.teamRepository.findByWorkspaceIdAndName({
      workspaceId,
      name: input.name,
    })

    if (existingTeam) throw new TeamAlreadyExistsException(existingTeam.name)

    if (input.leadId) {
      const leadId = UserId.create(input.leadId)

      const member = await this.workspaceMemberRepository.findMember({
        workspaceId,
        memberId: leadId,
      })

      if (!member) throw new TeamLeadNotWorkspaceMemberException()

      if (member.status !== WorkspaceMemberStatus.ACTIVE)
        throw new TeamLeadNotActiveWorkspaceMemberException()
    }

    const team = Team.create({
      workspaceId: input.workspaceId,
      name: input.name,
      description: input.description,
      avatarUrl: input.avatarUrl,
      leadId: input.leadId,
      createdBy: input.createdBy,
    })

    await this.teamRepository.save(team)

    const result = await this.teamQueryRepository.findByWorkspaceIdAndId({
      workspaceId,
      teamId: team.id,
    })

    if (!result) throw new TeamNotFoundException()

    return {
      team: result,
    }
  }
}
