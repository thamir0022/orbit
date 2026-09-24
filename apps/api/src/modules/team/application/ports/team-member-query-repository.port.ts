import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { ITransactionOptions } from '@/shared/application'

import { TeamId } from '../../domain/value-objects/team-id.vo'
import { TeamMemberListItem } from '../contracts/team-member-list-item.output'

export interface FindTeamMembersByWorkspaceIdAndTeamIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
}

export interface FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  userId: UserId
}

export interface TeamMemberQueryRepository {
  findByWorkspaceIdAndTeamId(
    props: FindTeamMembersByWorkspaceIdAndTeamIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMemberListItem[]>

  findByWorkspaceIdAndTeamIdAndUserId(
    props: FindTeamMemberByWorkspaceIdAndTeamIdAndUserIdProps,
    options?: ITransactionOptions
  ): Promise<TeamMemberListItem | null>
}

export const TEAM_MEMBER_QUERY_REPOSITORY = Symbol('TeamMemberQueryRepository')
