'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { roleKeys } from '@/entities/role'
import { workspaceMemberKeys } from '@/entities/workspace-member'
import { createWorkspaceRole } from '../api/create-workspace-role.api'
import type { CreateWorkspaceRoleInput, WorkspaceRole } from '@/entities/role'

type CreateWorkspaceRoleVariables = {
  input: CreateWorkspaceRoleInput
}

export function useCreateWorkspaceRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation<WorkspaceRole, Error, CreateWorkspaceRoleVariables>({
    mutationFn: ({ input }) => createWorkspaceRole(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roleKeys.all }),
        queryClient.invalidateQueries({ queryKey: workspaceMemberKeys.all }),
      ])
    },
  })
}
