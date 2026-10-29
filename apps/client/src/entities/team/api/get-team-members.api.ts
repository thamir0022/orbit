import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import type { UserSummary } from '@/shared/types/user-summary'

export interface TeamMember {
  readonly userId: UserSummary
  readonly status: 'active' | 'inactive'
  readonly addedBy: UserSummary
  readonly joinedAt: string
}

export async function getTeamMembers(key: string): Promise<TeamMember[]> {
  const { data } = await httpClient.get<{ readonly members: TeamMember[] }>(
    API_ROUTES.TEAMS.MEMBERS(key)
  )
  return data.members
}
