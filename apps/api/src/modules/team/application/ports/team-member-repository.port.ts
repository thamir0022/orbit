import { IBaseRepository, ITransactionOptions } from '@/shared/application'

import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import { TeamMember } from '../../domain/entities/team-member.entity'
import { TeamId } from '../../domain/value-objects/team-id.vo'
import { TeamMemberId } from '../../domain/value-objects/team-member-id.vo'

export interface FindTeamMembersByWorkspaceIdAndTeamIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
}

export interface FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  userId: UserId
}

export interface DeleteTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  userId: UserId
}

export interface FindTeamMembersByWorkspaceIdAndTeamIdAndUserIdsProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  userIds: UserId[]
}

export interface TeamMemberRepository extends IBaseRepository<
  TeamMember,
  TeamMemberId
> {
  findByWorkspaceIdAndTeamId(
    props: FindTeamMembersByWorkspaceIdAndTeamIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMember[]>

  findByWorkspaceIdAndTeamIdAndUserId(
    props: FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMember | null>

  deleteByWorkspaceIdAndTeamIdAndUserId(
    props: DeleteTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
    options?: ITransactionOptions
  ): Promise<void>

  findByWorkspaceIdAndTeamIdAndUserIds(
    props: FindTeamMembersByWorkspaceIdAndTeamIdAndUserIdsProps,
    options?: ITransactionOptions
  ): Promise<TeamMember[]>

  saveMany(entities: TeamMember[], options?: ITransactionOptions): Promise<void>
}

export const TEAM_MEMBER_REPOSITORY = Symbol('TeamMemberRepository')
