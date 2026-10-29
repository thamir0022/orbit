/** User identities requested for team membership in the authenticated workspace. */
export interface AddTeamMembersInput {
  readonly workspaceId: string
  readonly teamKey: string
  readonly userIds: readonly string[]
  readonly actorId: string
}
