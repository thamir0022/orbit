import { TeamStatus } from '../../domain/enums/team-status.enum'

export interface TeamDto {
  id: string
  name: string
  description?: string
  avatarUrl?: string
  status: TeamStatus
  leadId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
