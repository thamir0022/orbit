import { PermissionAction } from '../enums/permission-action.enum'
import { PermissionId } from '../value-objects/permission-id.vo'
import { PermissionKey } from '../value-objects/permission-key.vo'
import { PermissionResource } from '../enums/permission-resource.enum'
import { PermissionStatus } from '../enums/permission-status.enum'

export interface PermissionProps {
  id: PermissionId
  key: PermissionKey
  resource: PermissionResource
  action: PermissionAction
  description: string
  status: PermissionStatus
  createdAt: Date
  updatedAt: Date
}
