'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'

import type { GetStoriesParams } from '../model/story.types'
import { getStories } from './get-stories.api'
import { storyQueryKeys } from './story-query-keys'

export function useStoriesQuery(params: GetStoriesParams) {
  return useQuery({
    queryKey: storyQueryKeys.list(params),
    queryFn: ({ signal }) => getStories({ ...params, signal }),
    enabled: Boolean(params.workspaceId && params.teamKey),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  })
}
