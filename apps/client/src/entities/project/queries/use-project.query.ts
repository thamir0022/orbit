import { queryOptions, useQuery } from '@tanstack/react-query'

import { getProjectApi } from '../api/get-project.api'

import { projectKeys } from '../model/project.keys'

export const projectQueryOptions = (projectKey: string) =>
  queryOptions({
    queryKey: projectKeys.detail(projectKey),

    queryFn: () => getProjectApi(projectKey),

    staleTime: 30_000,
  })

export const useProjectQuery = (projectKey: string) => {
  return useQuery(projectQueryOptions(projectKey))
}
