import type { GetWorkspaceMembersParams } from './types'

export const workspaceMemberKeys = {
  all: ['workspace-members'] as const,
  byWorkspace: (workspaceId: string) =>
    ['workspace-members', 'workspace', workspaceId] as const,
  lists: () => [...workspaceMemberKeys.all, 'list'] as const,
  list: (workspaceId: string, params: GetWorkspaceMembersParams) =>
    [...workspaceMemberKeys.lists(), workspaceId, params] as const,
} as const
