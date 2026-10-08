export const teamQueryKeys = {
  all: ['teams'] as const,

  lists: () => [...teamQueryKeys.all, 'list'] as const,

  list: (workspaceId: string) =>
    [...teamQueryKeys.lists(), workspaceId] as const,

  details: () => [...teamQueryKeys.all, 'detail'] as const,

  detail: (teamId: string) => [...teamQueryKeys.details(), teamId] as const,
}
