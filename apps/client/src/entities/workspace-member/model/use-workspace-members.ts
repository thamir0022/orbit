'use client'

import { useQuery } from '@tanstack/react-query'
import { workspaceMemberKeys } from './query-keys'
import type {
  GetWorkspaceMembersParams,
  WorkspaceMembersResponse,
} from './types'
import { getWorkspaceMembers } from '../api/workspace-member.api'

export function useWorkspaceMembers(
  workspaceId: string,
  params: GetWorkspaceMembersParams
) {
  return useQuery<WorkspaceMembersResponse, Error>({
    queryKey: workspaceMemberKeys.list(workspaceId, params),
    queryFn: () => getWorkspaceMembers(params),
    enabled: Boolean(workspaceId),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  })
}
