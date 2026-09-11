import { PermissionAction } from '../domain/enums/permission-action.enum'
import { PermissionResource } from '../domain/enums/permission-resource.enum'
import { PermissionDefinition } from './permission-definition.interface'

const WORKSPACE_PERMISSIONS: PermissionDefinition[] = [
  {
    resource: PermissionResource.WORKSPACE,
    action: PermissionAction.VIEW,
    description: 'View workspace details',
  },
  {
    resource: PermissionResource.WORKSPACE,
    action: PermissionAction.UPDATE,
    description: 'Update workspace settings',
  },
]

const MEMBER_PERMISSIONS: PermissionDefinition[] = [
  {
    resource: PermissionResource.MEMBER,
    action: PermissionAction.INVITE,
    description: 'Invite workspace members',
  },
  {
    resource: PermissionResource.MEMBER,
    action: PermissionAction.DELETE,
    description: 'Remove workspace members',
  },
]

const ROLE_PERMISSIONS: PermissionDefinition[] = [
  {
    resource: PermissionResource.ROLE,
    action: PermissionAction.CREATE,
    description: 'Create roles',
  },
  {
    resource: PermissionResource.ROLE,
    action: PermissionAction.UPDATE,
    description: 'Update roles',
  },
  {
    resource: PermissionResource.ROLE,
    action: PermissionAction.DELETE,
    description: 'Delete roles',
  },
]

export const SYSTEM_PERMISSIONS: PermissionDefinition[] = [
  ...WORKSPACE_PERMISSIONS,
  ...MEMBER_PERMISSIONS,
  ...ROLE_PERMISSIONS,
]
