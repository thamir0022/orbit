import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { WorkspaceListItem } from './get-user-workspaces.server'
import { httpClient } from '@/shared/api/config/http-client'

interface GetUserWorkspacesResponse {
  workspaces: WorkspaceListItem[]
}

export async function getUserWorkspacesApi() {
  const res = await httpClient.get<GetUserWorkspacesResponse>(
    API_ROUTES.WORKSPACES.ALL,
    { skipAuthHandling: true }
  )

  return res
}
