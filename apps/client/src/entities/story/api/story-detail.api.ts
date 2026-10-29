import { httpClient } from '@/shared/api/config/http-client'
import { API_ROUTES } from '@/shared/api/routes/api.routes'
import type { WorkItemPriority, WorkItemStatus } from '@/entities/work-item'
export interface StoryDetail {
  id: string
  key: string
  title: string
  description?: string
  status: WorkItemStatus
  priority: WorkItemPriority | null
  storyPoints: number | null
}
export interface StoryInput {
  title: string
  description?: string
  priority: WorkItemPriority | null
  storyPoints: number | null
  status?: WorkItemStatus
}
export const storyPath = (teamKey: string, key?: string) =>
  API_ROUTES.TEAMS.STORIES(teamKey) + (key ? '/' + encodeURIComponent(key) : '')
export async function getStory(key: string, signal?: AbortSignal) {
  const { data } = await httpClient.get<{ workItem: StoryDetail }>(
    API_ROUTES.WORK_ITEMS.BY_KEY(key),
    { signal }
  )
  return data.workItem
}
export async function createStory(teamKey: string, input: StoryInput) {
  const { data } = await httpClient.post<{ workItem: StoryDetail }>(
    storyPath(teamKey),
    input
  )
  return data.workItem
}
export async function updateStory(
  teamKey: string,
  key: string,
  input: StoryInput
) {
  const { data } = await httpClient.patch<{ workItem: StoryDetail }>(
    storyPath(teamKey, key),
    input
  )
  return data.workItem
}
export async function deleteStory(teamKey: string, key: string) {
  await httpClient.delete(storyPath(teamKey, key))
}
