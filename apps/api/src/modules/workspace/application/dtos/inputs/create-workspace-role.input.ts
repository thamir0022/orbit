export interface CreateWorkspaceRoleInput {
  readonly workspaceId: string
  readonly name: string
  readonly description?: string
  readonly permissionIds: string[]
  readonly createdBy: string
}
