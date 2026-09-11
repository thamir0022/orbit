import { RoleStatus } from '@/modules/authorization/domain/enums/role-status.enum'

export interface UpdateWorkspaceRoleInput {
  readonly workspaceId: string
  readonly roleId: string
  readonly name?: string
  readonly description?: string
  readonly status?: RoleStatus
  readonly permissionIds: string[]
}
