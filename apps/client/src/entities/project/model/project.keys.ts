import type { ProjectQueryParams } from '@/features/project-filters/model/project-filter.types'

export const projectKeys = {
  all: ['projects'] as const,

  lists: () => [...projectKeys.all, 'list'] as const,

  list: (params: ProjectQueryParams) =>
    [...projectKeys.lists(), params] as const,
}
