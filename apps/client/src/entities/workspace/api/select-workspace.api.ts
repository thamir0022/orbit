import { API_ROUTES } from '@/shared/api/api.routes'
import { ApiResponse } from '@/shared/api/api.types'
import { httpClient } from '@/shared/lib/http/http-client'
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
  const res = await httpClient.post<ApiResponse<SelectWorkspaceApiResponse>>(
    API_ROUTES.AUTH.EXCHANGE,
    payload
  )

  return res
}
