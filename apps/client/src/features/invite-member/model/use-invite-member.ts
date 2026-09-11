'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inviteApi, inviteKeys } from '@/entities/invite'
import { workspaceMemberKeys } from '@/entities/workspace-member'
import type {
  CreateWorkspaceInvitationInput,
  CreateWorkspaceInvitationResponse,
  WorkspaceInvitation,
} from '@/entities/invite'
import { ApiResponse } from '@/shared/api/api.types'

export function useInviteMemberMutation(workspaceId: string) {
  const queryClient = useQueryClient()

  return useMutation<
    ApiResponse<CreateWorkspaceInvitationResponse>,
    Error,
    CreateWorkspaceInvitationInput
  >({
    mutationFn: (input) => inviteApi.createWorkspaceInvitation(input),
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
