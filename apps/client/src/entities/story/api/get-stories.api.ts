import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'

import type { GetStoriesParams, GetStoriesResponse } from '../model/story.types'

type GetStoriesApiParams = GetStoriesParams & {
  readonly signal?: AbortSignal
}

function serializeArrayParam(values?: readonly string[]): string | undefined {
  return values?.length ? values.join(',') : undefined
}

/** Fetches stories for a team. */
export async function getStories({
  teamKey,
  page,
  limit,
  search,
  statuses,
  priorities,
  sortField,
  sortOrder,
  signal,
}: GetStoriesApiParams): Promise<GetStoriesResponse> {
  const { data } = await httpClient.get<GetStoriesResponse>(
    API_ROUTES.TEAMS.STORIES(teamKey),
    {
      params: {
        page,
        limit,
        search,
        statuses: serializeArrayParam(statuses),
        priorities: serializeArrayParam(priorities),
        sortField,
        sortOrder,
      },
      signal,
    }
  )

  return data
}
