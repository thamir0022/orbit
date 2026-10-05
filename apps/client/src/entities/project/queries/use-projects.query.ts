import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { getProjectsApi } from '../api/get-projects.api'
import { projectKeys } from '../model/project.keys'

import type { ProjectQueryParams } from '@/features/project-filters/model/project-filter.types'

export const useProjectsQuery = (params: ProjectQueryParams) => {
  return useQuery({
    queryKey: projectKeys.list(params),

    queryFn: () => getProjectsApi(params),

    placeholderData: keepPreviousData,

    staleTime: 30_000,

    refetchOnWindowFocus: false,
  })
}
