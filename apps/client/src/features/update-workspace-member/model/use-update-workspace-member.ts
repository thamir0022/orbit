'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceMemberKeys } from '@/entities/workspace-member'
import { updateWorkspaceMember } from '../api/update-workspace-member.api'
import type { UpdateWorkspaceMemberFormValues } from './update-workspace-member.schema'

type UpdateWorkspaceMemberVariables = {
  memberId: string
  input: UpdateWorkspaceMemberFormValues
}

export function useUpdateWorkspaceMemberMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, input }: UpdateWorkspaceMemberVariables) =>
      updateWorkspaceMember(memberId, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: workspaceMemberKeys.all,
      })
    },
  })
}
