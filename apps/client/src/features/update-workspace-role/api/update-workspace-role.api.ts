import { UpdateWorkspaceRoleInput, WorkspaceRole } from '@/entities/role'
import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

interface UpdateWorkspaseRoleResponse {
  role: WorkspaceRole
}

export async function updateWorkspaceRole(
  roleId: string,
  input: UpdateWorkspaceRoleInput
): Promise<WorkspaceRole> {
  const { data } = await httpClient.patch<UpdateWorkspaseRoleResponse>(
    API_ROUTES.WORKSPACES.ROLES.UPDATE(roleId),
    input
  )

  return data.role
}
