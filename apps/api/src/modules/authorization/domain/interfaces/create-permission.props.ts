import { PermissionKey } from '../value-objects/permission-key.vo'
import { PermissionAction } from '../enums/permission-action.enum'
import { PermissionResource } from '../enums/permission-resource.enum'

export interface CreatePermissionProps {
  key: PermissionKey

  resource: PermissionResource

  action: PermissionAction

  description: string
}
