'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CreateWorkspaceInvitationInput,
  inviteApi,
  inviteKeys,
} from '@/entities/invite'
import { workspaceMemberKeys } from '@/entities/workspace-member'

export function useInviteMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateWorkspaceInvitationInput) =>
      inviteApi.createWorkspaceInvitation(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: inviteKeys.byWorkspace(workspaceId),
        }),
        queryClient.invalidateQueries({
          queryKey: workspaceMemberKeys.byWorkspace(workspaceId),
        }),
      ])
    },
  })
}
