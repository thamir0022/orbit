'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roleKeys } from '@/entities/role'
import { workspaceMemberKeys } from '@/entities/workspace-member'
import { deleteWorkspaceRole } from '../api/delete-workspace-role.api'

type DeleteWorkspaceRoleVariables = {
  roleId: string
}

export function useDeleteWorkspaceRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roleId }: DeleteWorkspaceRoleVariables) =>
      deleteWorkspaceRole(roleId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
        queryClient.invalidateQueries({ queryKey: workspaceMemberKeys.all }),
      ])
    },
  })
}
