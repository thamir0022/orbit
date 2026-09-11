'use client'

import { useQuery } from '@tanstack/react-query'
import { permissionKeys } from './query-keys'
import { getWorkspacePermissions } from '../api/permission.api'
import type { WorkspacePermission } from './types'

type UseWorkspacePermissionsOptions = {
  enabled?: boolean
}

export function useWorkspacePermissions(
  workspaceId: string,
  options: UseWorkspacePermissionsOptions = {}
) {
  const { enabled = true } = options

  return useQuery<WorkspacePermission[], Error>({
    queryKey: permissionKeys.list(workspaceId),
    queryFn: async () => {
      const response = await getWorkspacePermissions()
      return response.permissions
        .filter((permission) => permission.status === 'active')
        .sort((a, b) => {
          const resourceCompare = a.resource.localeCompare(b.resource)
          if (resourceCompare !== 0) return resourceCompare
          return a.action.localeCompare(b.action)
        })
    },
    enabled: Boolean(workspaceId) && enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  })
}
