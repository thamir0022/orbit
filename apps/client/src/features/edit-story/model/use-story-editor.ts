import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getStory,
  updateStory,
  deleteStory,
  type StoryInput,
} from '@/entities/story/api/story-detail.api'
import { storyQueryKeys } from '@/entities/story/api/story-query-keys'
export function useStoryEditor({
  workspaceId,
  workspaceSlug,
  teamKey,
  storyKey,
  enabled,
}: {
  workspaceId?: string
  workspaceSlug: string
  teamKey: string
  storyKey: string
  enabled: boolean
}) {
  const router = useRouter()
  const client = useQueryClient()
  const key = ['stories', 'detail', workspaceId, teamKey, storyKey] as const
  const query = useQuery({
    queryKey: key,
    queryFn: ({ signal }) => getStory(storyKey, signal),
    enabled: enabled,
  })
  const update = useMutation({
    mutationFn: (input: StoryInput) => updateStory(teamKey, storyKey, input),
    onSuccess: async (story) => {
      client.setQueryData(key, story)
      await client.invalidateQueries({ queryKey: storyQueryKeys.lists() })
    },
  })
  const listPath = '/' + workspaceSlug + '/teams/' + teamKey + '/stories'
  const remove = useMutation({
    mutationFn: () => deleteStory(teamKey, storyKey),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: storyQueryKeys.lists() })
      router.replace(listPath)
      client.removeQueries({ queryKey: key })
    },
  })

  return { query, update, remove, listPath }
}
