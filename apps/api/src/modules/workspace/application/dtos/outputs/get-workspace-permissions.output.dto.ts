import { PermissionDto } from '@/modules/authorization/application/models/permission.dto'

export interface GetWorkspacePermissionOutput {
  permissions: PermissionDto[]
}
