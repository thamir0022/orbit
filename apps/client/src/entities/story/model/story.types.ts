import type { WorkItemSummary } from '@/entities/work-item'

/** A Story is a Work Item whose type is STORY, not a separate backend aggregate. */
export type Story = Omit<WorkItemSummary, 'type'> & {
  readonly type: 'STORY'
}

export interface GetStoriesParams {
  readonly workspaceId: string
  readonly teamKey: string
}
