import type {
  WorkItemPriority,
  WorkItemStatus,
  WorkItemSummary,
} from '@/entities/work-item'

/** A Story is a Work Item whose type is STORY. */
export type Story = WorkItemSummary

export interface GetStoriesParams {
  readonly workspaceId: string
  readonly teamKey: string
  readonly page?: number
  readonly limit?: number
  readonly search?: string
  readonly statuses?: readonly WorkItemStatus[]
  readonly priorities?: readonly WorkItemPriority[]
  readonly sortField?: StorySortField
  readonly sortOrder?: StorySortOrder
}

/** Sort fields supported by the team stories API and list-table headers. */
export const STORY_SORT_FIELDS = [
  'title',
  'status',
  'priority',
  'storyPoints',
] as const

export type StorySortField = (typeof STORY_SORT_FIELDS)[number]

export type StorySortOrder = 'asc' | 'desc'

export function isStorySortField(value: string): value is StorySortField {
  return STORY_SORT_FIELDS.includes(value as StorySortField)
}

export interface GetStoriesResponse {
  readonly items: readonly Story[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly hasNextPage: boolean
}
