import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'
import { Workspace } from '../model/workspace.types'

export type SelectWorkspaceApiPayload = {
  slug: string
}

export type SelectWorkspaceApiResponse = {
  workspace: Workspace
}

export const selectWorkspaceApi = async (
  payload: SelectWorkspaceApiPayload
) => {
  const res = await httpClient.post<SelectWorkspaceApiResponse>(
    API_ROUTES.AUTH.EXCHANGE,
    payload
  )

  return res
}
