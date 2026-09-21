import { httpClient } from '@/shared/api/config/http-client'
import type {
  GetWorkspaceMembersParams,
  WorkspaceMembersResponse,
} from '../model/types'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

function buildQueryString(params: GetWorkspaceMembersParams): string {
  const searchParams = new URLSearchParams()

  searchParams.set('page', String(params.page))
  searchParams.set('limit', String(params.limit))

  if (params.status) searchParams.set('status', params.status)

  if (params.roleId) searchParams.set('roleId', params.roleId)

  if (params.search) searchParams.set('search', params.search)

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function getWorkspaceMembers(
  params: GetWorkspaceMembersParams
): Promise<WorkspaceMembersResponse> {
  const queryString = buildQueryString(params)

  const { data } = await httpClient.get<WorkspaceMembersResponse>(
    API_ROUTES.WORKSPACES.MEMBERS.ALL(queryString)
  )

  return data
}
