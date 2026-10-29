import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

/** Team membership returned by both list and add member endpoints. */
export interface TeamMember {
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  readonly displayName: string
  readonly email: string
  readonly status: 'active' | 'inactive'
  readonly joinedAt: string
  readonly addedBy: {
    readonly id: string
    readonly email: string
    readonly displayName: string
    readonly avatarUrl: string | null
  }
}

export async function getTeamMembers(key: string): Promise<TeamMember[]> {
  const { data } = await httpClient.get<{ readonly members: TeamMember[] }>(
    API_ROUTES.TEAMS.MEMBERS(key)
  )
  return data.members
}
