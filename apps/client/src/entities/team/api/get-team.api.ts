import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type { Team } from '../model/team.types'

interface GetTeamApiResponse {
  readonly team: Team
}

export const getTeam = async (id: string): Promise<Team> => {
  const { data } = await httpClient.get<GetTeamApiResponse>(
    API_ROUTES.TEAMS.BY_ID(id)
  )

  return data.team
}
