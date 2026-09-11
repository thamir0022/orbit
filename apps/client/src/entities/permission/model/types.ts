export interface WorkspacePermission {
  id: string
  key: string
  resource: string
  action: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface WorkspacePermissionsResponse {
  permissions: WorkspacePermission[]
}
