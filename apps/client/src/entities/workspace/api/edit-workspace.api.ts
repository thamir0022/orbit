import {
  CompanySize,
  CompanyType,
  Workspace,
  WorkspaceSettings,
} from '@/entities/workspace'
import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

export type EditWorkspacePayload = {
  name?: string
  slug?: string
  companyType?: CompanyType
  companySize?: CompanySize
  settings?: Partial<WorkspaceSettings>
}

type EditWorkspaceResponse = {
  workspace: Workspace
}

export const editWorkspace = async (payload: EditWorkspacePayload) => {
  const res = await httpClient.put<EditWorkspaceResponse>(
    API_ROUTES.WORKSPACES.UPDATE_WORKSPACE,
    payload
  )

  return res
}
