'use client'

import { useQuery } from '@tanstack/react-query'

import type { GetStoriesParams } from '../model/story.types'
import { getStories } from './get-stories.api'
import { storyQueryKeys } from './story-query-keys'

export function useStoriesQuery(params: GetStoriesParams) {
  return useQuery({
    queryKey: storyQueryKeys.list(params),
    queryFn: ({ signal }) => getStories({ teamKey: params.teamKey, signal }),
    enabled: Boolean(params.workspaceId && params.teamKey),
    staleTime: 30_000,
    select: (data) => data.items,
  })
}
