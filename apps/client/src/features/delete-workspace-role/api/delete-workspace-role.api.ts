import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'

export async function deleteWorkspaceRole(roleId: string): Promise<void> {
  await httpClient.delete(API_ROUTES.WORKSPACES.ROLES.DELETE(roleId))
}
