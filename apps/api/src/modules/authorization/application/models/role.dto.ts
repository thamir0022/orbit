import { RoleScope } from '../../domain/enums/role-scope.enum'

export interface RoleDto {
  id: string
  workspaceId: string
  name: string
  description?: string
  scope: RoleScope
  isPredefined: boolean
  status: string
  createdAt: Date
  updatedAt: Date
}
