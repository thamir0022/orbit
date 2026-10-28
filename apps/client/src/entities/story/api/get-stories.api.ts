import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import type { WorkItemSummary } from '@/entities/work-item'

import type { Story } from '../model/story.types'

interface GetStoriesApiResponse {
  readonly workItems: WorkItemSummary[]
}

interface GetStoriesApiParams {
  readonly teamKey: string
  readonly signal?: AbortSignal
}

/** Fetches Story-type Work Items for the selected team. */
export async function getStories({
  teamKey,
  signal,
}: GetStoriesApiParams): Promise<Story[]> {
  const { data } = await httpClient.get<GetStoriesApiResponse>(
    API_ROUTES.WORK_ITEMS.BASE,
    {
      params: {
        teamKey,
        type: 'STORY',
      },
      signal,
    }
  )

  // TODO: should we need to remove this or?
  return data.workItems.filter((workItem): workItem is Story => {
    return workItem.type === 'story'
  })
}
