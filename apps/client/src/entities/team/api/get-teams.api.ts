import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import { TeamSummary } from '../model/team.types'

interface GetTeamsApiResponse {
  readonly teams: TeamSummary[]
}

export const getTeams = async (): Promise<TeamSummary[]> => {
  const { data } = await httpClient.get<GetTeamsApiResponse>(
    API_ROUTES.TEAMS.BASE
  )

  return data.teams
}
