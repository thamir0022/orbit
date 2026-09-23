export interface CreateTeamInput {
  readonly workspaceId: string
  readonly name: string
  readonly description?: string
  readonly avatarUrl?: string
  readonly leadId?: string
  readonly createdBy: string
}
