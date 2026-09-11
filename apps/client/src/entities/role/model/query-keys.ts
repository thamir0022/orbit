export const roleKeys = {
  all: ['workspace-roles'] as const,
  list: (workspaceId: string) =>
    ['workspace-roles', 'list', workspaceId] as const,
  byWorkspace: (workspaceId: string) =>
    ['roles', 'workspace', workspaceId] as const,
  detail: (workspaceId: string, roleId: string) =>
    ['workspace-roles', 'detail', workspaceId, roleId] as const,
} as const
