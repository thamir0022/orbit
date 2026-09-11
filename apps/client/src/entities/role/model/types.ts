export interface WorkspaceRole {
  id: string
  name: string
  description: string | null
  isPredefined: boolean
  permissionIds?: string[]
}

export interface WorkspaceRolesResponse {
  roles: WorkspaceRole[]
}

export interface WorkspaceRoleDetailResponse {
  role: WorkspaceRole
}

export interface CreateWorkspaceRoleInput {
  name: string
  description: string
  permissionIds: string[]
}

export interface UpdateWorkspaceRoleInput {
  name?: string
  description?: string
  permissionIds: string[]
}
