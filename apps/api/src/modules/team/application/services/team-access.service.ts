import { Inject, Injectable } from '@nestjs/common'
import { DomainException } from '@/shared/domain'
import { UserId } from '@/modules/user/domain'
import {
  WorkspaceMemberStatus,
  WorkspaceStatus,
} from '@/modules/workspace/domain'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  IWorkspaceMemberRepository,
  WORKSPACE_REPOSITORY,
  IWorkspaceRepository,
} from '@/modules/workspace/application'
import { Team } from '../../domain/entities/team.entity'
import {
  TEAM_MEMBER_REPOSITORY,
  TeamMemberRepository,
} from '../ports/team-member-repository.port'
import { ITransactionOptions } from '@/shared/application'
import { ITeamAccessService } from './team-access.service.interface'

/** Enforces team membership and leadership rules independently of role permissions. */

@Injectable()
export class TeamAccessService implements ITeamAccessService {
  constructor(
    @Inject(TEAM_MEMBER_REPOSITORY)
    private readonly members: TeamMemberRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMembers: IWorkspaceMemberRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaces: IWorkspaceRepository
  ) {}

  // Check both memberships so a removed workspace member cannot keep team access.
  async assertMember(
    team: Team,
    actorId: string,
    options?: ITransactionOptions
  ): Promise<void> {
    if (!(await this.isActiveMember(team, actorId, options))) this.deny()
  }

  private async isActiveMember(
    team: Team,
    actorId: string,
    options?: ITransactionOptions
  ): Promise<boolean> {
    if (!actorId) return false
    const userId = UserId.create(actorId)
    const workspaceMember = await this.workspaceMembers.findMember({
      workspaceId: team.workspaceId,
      memberId: userId,
    })
    if (workspaceMember?.status !== WorkspaceMemberStatus.ACTIVE) return false
    const member = await this.members.findByWorkspaceIdAndTeamIdAndUserId(
      { workspaceId: team.workspaceId, teamId: team.id, userId },
      options
    )
    return member?.isActive() ?? false
  }

  // Only the workspace owner can recover a team without an active lead.
  async assertLead(
    team: Team,
    actorId: string,
    options?: ITransactionOptions
  ): Promise<void> {
    if (!actorId) this.deny()
    if (
      team.leadId &&
      (await this.isActiveMember(team, team.leadId.value, options))
    ) {
      if (team.leadId.value !== actorId) this.deny()
      return
    }

    const workspace = await this.workspaces.findById(team.workspaceId, options)
    if (
      workspace?.status !== WorkspaceStatus.ACTIVE ||
      workspace.ownerId.value !== actorId
    )
      this.deny()

    const owner = await this.workspaceMembers.findMember({
      workspaceId: team.workspaceId,
      memberId: UserId.create(actorId),
    })
    if (owner?.status !== WorkspaceMemberStatus.ACTIVE) this.deny()
  }
  private deny(): never {
    throw new DomainException({
      code: 'TEAM_ACCESS_DENIED',
      message: 'You do not have access to perform this team operation.',
      statusCode: 403,
    })
  }
}
