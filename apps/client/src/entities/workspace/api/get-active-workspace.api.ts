import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'
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
