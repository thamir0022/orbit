'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roleKeys } from '@/entities/role'
import { workspaceMemberKeys } from '@/entities/workspace-member'
import { updateWorkspaceRole } from '../api/update-workspace-role.api'
import type { UpdateWorkspaceRoleInput, WorkspaceRole } from '@/entities/role'

type UpdateWorkspaceRoleVariables = {
  roleId: string
  input: UpdateWorkspaceRoleInput
}

export function useUpdateWorkspaceRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation<WorkspaceRole, Error, UpdateWorkspaceRoleVariables>({
    mutationFn: ({ roleId, input }) => updateWorkspaceRole(roleId, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
        queryClient.invalidateQueries({ queryKey: workspaceMemberKeys.all }),
      ])
    },
  })
}
