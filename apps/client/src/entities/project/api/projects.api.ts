// src/entities/project/api/projects.api.ts
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { httpClient } from '@/shared/api/config/http-client'
import type {
  CreateProjectInput,
  CreateProjectResponse,
  GetWorkspaceProjectsParams,
  GetWorkspaceProjectsResponse,
  Project,
} from '../model/types'

function appendQueryParams(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    searchParams.set(key, String(value))
  }

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

export async function getWorkspaceProjects(
  params: GetWorkspaceProjectsParams = {}
) {
  const { data } = await httpClient.get<GetWorkspaceProjectsResponse>(
    `${API_ROUTES.PROJECTS.ALL}${appendQueryParams({
      search: params.search?.trim(),
      status:
        params.status && params.status !== 'all' ? params.status : undefined,
      priority:
        params.priority && params.priority !== 'all'
          ? params.priority
          : undefined,
      type: params.type && params.type !== 'all' ? params.type : undefined,
      page: params.page,
      limit: params.limit,
    })}`
  )

  return data
}

export async function getWorkspaceProject(projectId: string) {
  const { data } = await httpClient.get<{ project: Project }>(
    API_ROUTES.PROJECTS.PROJECT(projectId)
  )

  return data
}

export async function createWorkspaceProject(body: CreateProjectInput) {
  const { data } = await httpClient.post<CreateProjectResponse>(
    API_ROUTES.PROJECTS.ALL,
    body
  )

  return data
}
