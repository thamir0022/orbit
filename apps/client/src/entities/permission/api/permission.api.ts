import { httpClient } from '@/shared/api/config/http-client'
import type { WorkspacePermissionsResponse } from '../model/types'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export async function getWorkspacePermissions(): Promise<WorkspacePermissionsResponse> {
  const { data } = await httpClient.get<WorkspacePermissionsResponse>(
    API_ROUTES.WORKSPACES.PERMISSIONS.ALL
  )

  return data
}
