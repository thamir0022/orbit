import { TeamMemberStatus } from '../../domain/enums/team-member-status.enum'

export interface TeamMemberDto {
  id: string
  workspaceId: string
  teamId: string
  userId: string
  status: TeamMemberStatus
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}
