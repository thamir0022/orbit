'use client'

import { useQuery } from '@tanstack/react-query'

import { getWorkspaceRole } from '../api/role.api'
import { roleKeys } from './query-keys'
import type { WorkspaceRole } from './types'

type UseWorkspaceRoleOptions = {
  enabled?: boolean
  placeholderData?: WorkspaceRole
}

export function useWorkspaceRole(
  workspaceId: string,
  roleId: string,
  options: UseWorkspaceRoleOptions = {}
) {
  const { enabled = true, placeholderData } = options

  return useQuery<WorkspaceRole, Error>({
    queryKey: roleKeys.detail(workspaceId, roleId),
    queryFn: () => getWorkspaceRole(roleId),
    enabled: Boolean(workspaceId && roleId) && enabled,
    staleTime: 60_000,
    placeholderData: placeholderData ? () => placeholderData : undefined,
  })
}
