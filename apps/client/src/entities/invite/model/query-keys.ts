export const inviteKeys = {
  all: ['invitations'] as const,
  byWorkspace: (workspaceId: string) =>
    ['invitations', 'workspace', workspaceId] as const,
  byId: (invitationId: string) => ['invitations', 'id', invitationId] as const,
} as const
