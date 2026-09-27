export interface AddTeamMembersInput {
  readonly workspaceId: string
  readonly teamId: string
  readonly memberIds: string[]
  readonly actorId: string
}
