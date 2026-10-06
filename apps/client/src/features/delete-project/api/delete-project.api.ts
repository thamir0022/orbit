import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export const deleteProject = async (projectKey: string): Promise<void> => {
  await httpClient.delete(API_ROUTES.PROJECTS.BY_KEY(projectKey))
}
