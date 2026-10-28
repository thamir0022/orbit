import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type { Story, GetStoriesResponse } from '../model/story.types'

interface GetStoriesApiParams {
  readonly teamKey: string
  readonly signal?: AbortSignal
}

/** Fetches stories for a team. */
export async function getStories({
  teamKey,
  signal,
}: GetStoriesApiParams): Promise<GetStoriesResponse> {
  const { data } = await httpClient.get<GetStoriesResponse>(
    API_ROUTES.TEAMS.STORIES(teamKey),
    { signal }
  )

  return data
}
