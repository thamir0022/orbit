import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import { Project } from '../model/project.types'

interface GetProjectResponse {
  project: Project
}

export const getProjectApi = async (projectKey: string) => {
  const response = await httpClient.get<GetProjectResponse>(
    API_ROUTES.PROJECTS.BY_KEY(projectKey)
  )

  return response.data.project
}
