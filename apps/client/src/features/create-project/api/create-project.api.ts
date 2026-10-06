import { httpClient } from '@/shared/api/config/http-client'

import {
  ProjectPriority,
  ProjectStage,
  ProjectType,
  type Project,
} from '@/entities/project/model/project.types'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

export interface CreateProjectRequest {
  readonly name: string
  readonly description?: string
  readonly startDate?: Date
  readonly targetEndDate?: Date
  readonly type?: ProjectType
  readonly stage?: ProjectStage
  readonly priority?: ProjectPriority
}

export interface CreateProjectResponse {
  readonly project: Project
}

export const createProject = async (input: CreateProjectRequest) => {
  const res = await httpClient.post<CreateProjectResponse>(
    API_ROUTES.PROJECTS.LIST,
    input
  )

  return res.data
}
