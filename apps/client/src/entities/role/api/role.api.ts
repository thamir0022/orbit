import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'
import { WorkspaceRole } from '../model/types'

interface GetWorkspaceRolesResponse {
  roles: WorkspaceRole[]
}

interface GetWorkspaceRoleResponse {
  role: WorkspaceRole
}

export type GetWorkspaceRoleType = 'all' | 'assignable'

export async function getWorkspaceRoles(type: GetWorkspaceRoleType = 'all') {
  const { data } = await httpClient.get<GetWorkspaceRolesResponse>(
    `${API_ROUTES.WORKSPACES.ROLES.ALL}?type=${type}`
  )

  return data
}

export async function getWorkspaceRole(id: string) {
  const { data } = await httpClient.get<GetWorkspaceRoleResponse>(
    API_ROUTES.WORKSPACES.ROLES.ROLE(id)
  )

  return data
}
