import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

/** Public identity returned by the lightweight workspace member endpoint. */
export interface WorkspaceMemberSummary {
  readonly id: string
  readonly firstName: string
  readonly lastName: string
  readonly displayName: string
  readonly avatarUrl: string | null
}

/** Loads every page so the picker can search the complete workspace directory. */
export async function getWorkspaceMemberSummaries(): Promise<
  WorkspaceMemberSummary[]
> {
  const members: WorkspaceMemberSummary[] = []
  let page = 1
  let totalPages = 1
  do {
    const { data } = await httpClient.get<{
      workspaceMembers: WorkspaceMemberSummary[]
      meta: { totalPages: number }
    }>(`${API_ROUTES.WORKSPACES.MEMBERS.SUMMARIES}?page=${page}&limit=100`)
    members.push(...data.workspaceMembers)
    totalPages = data.meta.totalPages
    page += 1
  } while (page <= totalPages)
  return members
}
