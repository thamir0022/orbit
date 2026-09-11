import type { CreateWorkspaceRoleInput, WorkspaceRole } from '@/entities/role'
import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

interface CreateWorkspaceRoleResponse {
  role: WorkspaceRole
}

export async function createWorkspaceRole(
  input: CreateWorkspaceRoleInput
): Promise<WorkspaceRole> {
  const { data } = await httpClient.post<CreateWorkspaceRoleResponse>(
    API_ROUTES.WORKSPACES.ROLES.CREATE,
    input
  )

  console.log(['DATA'], 'data')

  return data.role
}
