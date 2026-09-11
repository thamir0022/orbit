export interface WorkspaceMember {
  id: string
  joinedAt: string
  status: string
  userId: string
  displayName: string
  email: string
  roleId: string
  roleName: string
}

export interface WorkspaceMembersMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface WorkspaceMembersResponse {
  workspaceMembers: WorkspaceMember[]
  meta: WorkspaceMembersMeta
}

export interface GetWorkspaceMembersParams {
  page: number
  limit: number
  status?: string
  roleId?: string
  search?: string
}
