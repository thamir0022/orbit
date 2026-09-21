import { UpdateWorkspaceRoleInput, WorkspaceRole } from '@/entities/role'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'

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
