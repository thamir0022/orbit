import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createStory,
  type StoryInput,
} from '@/entities/story/api/story-detail.api'
import { storyQueryKeys } from '@/entities/story/api/story-query-keys'
export function useCreateStoryMutation(teamKey: string) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (input: StoryInput) => createStory(teamKey, input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: storyQueryKeys.lists() })
    },
  })
}
