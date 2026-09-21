import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'
import { Workspace } from '../model/workspace.types'

export interface GetActiveWorkspaceData {
  workspace: Workspace
}

export const getActiveWorkspaceApi =
  async (): Promise<GetActiveWorkspaceData | null> => {
    const response = await httpClient.get<GetActiveWorkspaceData>(
      API_ROUTES.WORKSPACES.ACTIVE
    )

    return response.data
  }
