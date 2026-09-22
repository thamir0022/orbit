import { TeamStatus } from '../../domain/enums/team-status.enum'

export interface TeamDto {
  id: string
  workspaceId: string
  name: string
  description?: string
  avatar?: string
  status?: TeamStatus
  leadId?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
