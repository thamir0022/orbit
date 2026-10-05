import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type { ProjectQueryParams } from '@/features/project-filters/model/project-filter.types'

import type { GetProjectsResponse } from '../model/project.types'

const serializeArrayParam = (
  values?: readonly string[]
): string | undefined => {
  if (!values?.length) {
    return undefined
  }

  return values.join(',')
}

export const getProjectsApi = async (
  params: ProjectQueryParams = {}
): Promise<GetProjectsResponse> => {
  const response = await httpClient.get<GetProjectsResponse>(
    API_ROUTES.PROJECTS.LIST,
    {
      params: {
        page: params.page,
        limit: params.limit,

        search: params.search,

        types: serializeArrayParam(params.types),

        stages: serializeArrayParam(params.stages),

        priorities: serializeArrayParam(params.priorities),

        statuses: serializeArrayParam(params.statuses),

        leadId: params.leadId,

        startDateFrom: params.startDateFrom,

        startDateTo: params.startDateTo,

        targetEndDateFrom: params.targetEndDateFrom,

        targetEndDateTo: params.targetEndDateTo,

        sortField: params.sortField,
        sortOrder: params.sortOrder,
      },
    }
  )

  return response.data
}
