import type { ProjectQueryParams } from '@/features/project-filters/model/project-filter.types'

export const projectKeys = {
  all: ['projects'] as const,

  lists: () => [...projectKeys.all, 'list'] as const,

  list: (params: ProjectQueryParams) =>
    [...projectKeys.lists(), params] as const,

  details: () => [...projectKeys.all, 'detail'] as const,

  detail: (projectKey: string) =>
    [...projectKeys.details(), projectKey] as const,
}
