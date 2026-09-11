import { PermissionAction } from '../domain/enums/permission-action.enum'
import { PermissionResource } from '../domain/enums/permission-resource.enum'

export interface PermissionDefinition {
  resource: PermissionResource
  action: PermissionAction
  description: string
}
