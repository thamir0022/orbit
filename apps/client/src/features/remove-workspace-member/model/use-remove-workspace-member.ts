'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceMemberKeys } from '@/entities/workspace-member'
import { removeWorkspaceMember } from '../api/remove-workspace-member.api'

type RemoveWorkspaceMemberVariables = {
  memberId: string
}

export function useRemoveWorkspaceMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId }: RemoveWorkspaceMemberVariables) =>
      removeWorkspaceMember(memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceMemberKeys.all,
      })
    },
  })
}
