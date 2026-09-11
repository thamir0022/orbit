import { API_ROUTES } from '@/shared/api/api.routes'
import { httpClient } from '@/shared/lib/http/http-client'

interface GetUserWorkspacesData {
  name: string
  slug: string
  logoUrl: string
}

export async function getUserWorkspacesApi() {
  const response = await httpClient.get<GetUserWorkspacesData>(
    API_ROUTES.WORKSPACES.ALL
  )

  return response.data
}
