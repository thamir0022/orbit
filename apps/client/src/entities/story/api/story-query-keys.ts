import type { GetStoriesParams } from '../model/story.types'

export const storyQueryKeys = {
  all: ['stories'] as const,
  lists: () => [...storyQueryKeys.all, 'list'] as const,
  list: (params: GetStoriesParams) =>
    [...storyQueryKeys.lists(), params] as const,
}
