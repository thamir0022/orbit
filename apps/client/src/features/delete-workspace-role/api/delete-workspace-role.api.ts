import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

export async function deleteWorkspaceRole(roleId: string): Promise<void> {
  await httpClient.delete(API_ROUTES.WORKSPACES.ROLES.DELETE(roleId))
}
