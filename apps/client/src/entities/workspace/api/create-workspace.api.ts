import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

export const createWorkspaceApi = async () => {
  const { data } = await httpClient.post(API_ROUTES.WORKSPACES.CREATE)

  return data
}
