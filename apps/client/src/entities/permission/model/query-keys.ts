export const permissionKeys = {
  all: ['workspace-permissions'] as const,
  list: (workspaceId: string) =>
    ['workspace-permissions', 'list', workspaceId] as const,
} as const
