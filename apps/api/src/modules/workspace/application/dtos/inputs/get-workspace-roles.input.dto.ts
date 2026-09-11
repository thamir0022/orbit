import { RoleScope } from '@/modules/authorization/domain/enums/role-scope.enum'
import { RoleStatus } from '@/modules/authorization/domain/enums/role-status.enum'

export interface GetWorkspaceRolesInput {
  readonly workspaceId: string
  readonly type: 'all' | 'assignable'
  readonly name?: string
  readonly scope?: RoleScope
  readonly status?: RoleStatus
}
