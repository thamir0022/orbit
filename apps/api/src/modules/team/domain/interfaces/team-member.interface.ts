import { WorkspaceId } from '@/modules/workspace/domain'
import { UserId } from '@/modules/user/domain'

import { TeamMemberId } from '../value-objects/team-member-id.vo'
import { TeamId } from '../value-objects/team-id.vo'
import { TeamMemberStatus } from '../enums/team-member-status.enum'

export interface TeamMemberProps {
  id: TeamMemberId
  workspaceId: WorkspaceId
  teamId: TeamId
  userId: UserId
  status: TeamMemberStatus
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreateTeamMemberProps {
  workspaceId: WorkspaceId
  teamId: TeamId
  userId: UserId
}
