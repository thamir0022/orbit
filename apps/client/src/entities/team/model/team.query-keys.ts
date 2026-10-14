export const teamKeys = {
  all: ['teams'] as const,

  lists: () => [...teamKeys.all, 'list'] as const,

  details: () => [...teamKeys.all, 'detail'] as const,

  detail: (teamId: string) => [...teamKeys.details(), teamId] as const,
}
