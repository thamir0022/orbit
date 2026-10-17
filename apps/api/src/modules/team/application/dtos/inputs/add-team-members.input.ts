export interface AddTeamMembersInput {
  readonly workspaceId: string
  readonly teamKey: string
  readonly memberIds: string[]
  readonly actorId: string
}
