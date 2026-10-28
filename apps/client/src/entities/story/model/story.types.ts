import type { WorkItemSummary } from '@/entities/work-item'

/** A Story is a Work Item whose type is STORY. */
export type Story = WorkItemSummary

export interface GetStoriesParams {
  readonly workspaceId: string
  readonly teamKey: string
}

export interface GetStoriesResponse {
  readonly items: readonly Story[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly hasNextPage: boolean
}
