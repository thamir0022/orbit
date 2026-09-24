import { Inject, Injectable } from '@nestjs/common'
import { UpdateTeamInput, UpdateTeamOutput } from '../dtos'
import { IUpdateTeamUseCase } from './update-team.interface'
import {
  WorkspaceId,
  WorkspaceMemberStatus,
  WorkspaceStatus,
} from '@/modules/workspace/domain'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import {
  IWorkspaceMemberRepository,
  IWorkspaceRepository,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import { TEAM_REPOSITORY, TeamRepository } from '../ports/team-repository.port'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
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
export class UpdateTeamUseCase implements IUpdateTeamUseCase {
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

  async execute(input: UpdateTeamInput): Promise<UpdateTeamOutput> {
    const workspaceId = WorkspaceId.create(input.workspaceId)

    const teamId = TeamId.create(input.teamId)

    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const team = await this.teamRepository.findByWorkspaceIdAndId({
      workspaceId,
      teamId,
    })

    if (!team) throw new TeamNotFoundException()

    if (input.name) {
      const teamWithSameName =
        await this.teamRepository.findByWorkspaceIdAndName({
          workspaceId,
          name: input.name,
        })

      if (teamWithSameName && !team.id.equals(teamWithSameName.id))
        throw new TeamAlreadyExistsException(input.name)
    }

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

    team.updateTeam({
      name: input.name,
      description: input.description,
      avatarUrl: input.avatarUrl,
      leadId: input.leadId,
      status: input.status,
    })

    await this.teamRepository.save(team)

    const result = await this.teamQueryRepository.findByWorkspaceIdAndId({
      workspaceId,
      teamId: team.id,
    })

    return {
      team: result!,
    }
  }
}
