import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'
import { WorkspaceListItem } from './get-user-workspaces.server'

interface GetUserWorkspacesResponse {
  workspaces: WorkspaceListItem[]
}

export async function getUserWorkspacesApi() {
  const res = await httpClient.get<GetUserWorkspacesResponse>(
    API_ROUTES.WORKSPACES.ALL
  )

  return res
}
