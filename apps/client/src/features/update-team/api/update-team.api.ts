import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type { Team, TeamStatus } from '@/entities/team/model/team.types'

interface UpdateTeamPayload {
  readonly name?: string
  readonly description?: string
  readonly status?: TeamStatus
  readonly leadId?: string
}

interface UpdateTeamApiResponse {
  readonly team: Team
}

export const updateTeam = async (
  teamId: string,
  payload: UpdateTeamPayload
): Promise<Team> => {
  const { data } = await httpClient.put<UpdateTeamApiResponse>(
    API_ROUTES.TEAMS.BY_ID(teamId),
    payload
  )

  return data.team
}
