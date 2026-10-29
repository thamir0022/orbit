import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

/** Adds selected workspace users to a team. */
export async function addTeamMembers(
  teamKey: string,
  userIds: string[]
): Promise<void> {
  await httpClient.post(API_ROUTES.TEAMS.MEMBERS(teamKey), { userIds })
}

/** Removes a user from the team without removing workspace membership. */
export async function removeTeamMember(
  teamKey: string,
  userId: string
): Promise<void> {
  await httpClient.delete(API_ROUTES.TEAMS.MEMBER(teamKey, userId))
}
