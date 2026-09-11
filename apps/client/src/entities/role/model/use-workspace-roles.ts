'use client'

import { useQuery } from '@tanstack/react-query'
import { roleKeys } from './query-keys'
import { getWorkspaceRoles, GetWorkspaceRoleType } from '../api/role.api'
import type { WorkspaceRole } from './types'

export function useWorkspaceRoles(
  workspaceId: string,
  type: GetWorkspaceRoleType = 'all'
) {
  return useQuery<WorkspaceRole[]>({
    queryKey: roleKeys.list(workspaceId),
    queryFn: async () => {
      const response = await getWorkspaceRoles(type)

      return response.roles.toSorted((a, b) => a.name.localeCompare(b.name))
    },
    enabled: Boolean(workspaceId),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  })
}
