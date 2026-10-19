import { UserSummaryOutput } from '@/shared/application/contracts'
import { TeamStatus } from '../../domain/enums/team-status.enum'

export interface TeamListItemOutput {
  key: string
  name: string
  description?: string
  avatarUrl?: string
  status: TeamStatus
  lead: UserSummaryOutput | null
  createdBy: UserSummaryOutput
  createdAt: Date
  updatedAt: Date
}
