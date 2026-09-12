export const workspaceKeys = {
  all: ['workspace'] as const,
  current: () => [...workspaceKeys.all, 'current'] as const,
}
