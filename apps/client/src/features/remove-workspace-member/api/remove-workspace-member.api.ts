import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'

export async function removeWorkspaceMember(memberId: string): Promise<void> {
  await httpClient.delete(API_ROUTES.WORKSPACES.MEMBERS.REMOVE(memberId))
}
