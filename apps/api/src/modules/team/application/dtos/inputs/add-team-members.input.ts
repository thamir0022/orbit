export interface AddTeamMembersInput {
  readonly workspaceId: string
  readonly teamId: string
  readonly userIds: string[]
  readonly actorId: string
}
