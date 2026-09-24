import { TeamMemberStatus } from '../../domain/enums/team-member-status.enum'

export interface TeamMemberDto {
  id: string
  workspaceId: string
  teamId: string
  userId: string
  status: TeamMemberStatus
  addedBy: string
  joinedAt: Date
  createdAt: Date
  updatedAt: Date
}
