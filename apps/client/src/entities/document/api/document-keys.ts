export const documentKeys = {
  all: ['documents'] as const,

  lists: () => [...documentKeys.all, 'list'] as const,

  list: () => [...documentKeys.lists()] as const,

  details: () => [...documentKeys.all, 'detail'] as const,

  detail: (documentId: string) =>
    [...documentKeys.details(), documentId] as const,

  creates: () => [...documentKeys.all, 'create'] as const,

  updates: () => [...documentKeys.all, 'update'] as const,
}
