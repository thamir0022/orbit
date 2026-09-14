import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'
import { Workspace } from '../model/workspace.types'
import { CreateWorkspaceData } from '../model/create-workspace.schema'

interface CreateWorkspaceRespose {
  workspace: Workspace
}

export const createWorkspaceApi = async (payload: CreateWorkspaceData) => {
  const res = await httpClient.post<CreateWorkspaceRespose>(
    API_ROUTES.WORKSPACES.CREATE,
    payload
  )

  return res
}
