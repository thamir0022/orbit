import { RoleScope } from '../domain/enums/role-scope.enum'

export interface SystemRoleDefinition {
  name: string
  description: string
  scope: RoleScope
  permissions: string[]
}
