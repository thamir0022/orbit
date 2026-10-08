import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export interface CreateTeamPayload {
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId?: string
  readonly memberIds?: readonly string[]
}

export const createTeamApi = async (
  payload: CreateTeamPayload
): Promise<void> => {
  await httpClient.post(API_ROUTES.TEAMS.BASE, payload)
}
