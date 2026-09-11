import { PermissionAction } from '../domain/enums/permission-action.enum'
import { PermissionResource } from '../domain/enums/permission-resource.enum'
import { RoleScope } from '../domain/enums/role-scope.enum'
import { SystemRole } from '../domain/enums/system-role.enum'
import { SystemRoleDefinition } from './system-role-definition.interface'

export const SYSTEM_ROLES: SystemRoleDefinition[] = [
  {
    name: SystemRole.PLATFORM_ADMIN,

    description: 'Platform administrator',

    scope: RoleScope.SYSTEM,

    permissions: ['*'],
  },

  {
    name: SystemRole.WORKSPACE_ADMIN,

    description: 'Workspace administrator',

    scope: RoleScope.WORKSPACE,

    permissions: [
      `${PermissionResource.WORKSPACE}:${PermissionAction.VIEW}`,

      `${PermissionResource.MEMBER}:${PermissionAction.INVITE}`,

      `${PermissionResource.ROLE}:${PermissionAction.CREATE}`,
      `${PermissionResource.ROLE}:${PermissionAction.UPDATE}`,
    ],
  },

  {
    name: SystemRole.MEMBER,

    description: 'Workspace member',

    scope: RoleScope.WORKSPACE,

    permissions: [`${PermissionResource.WORKSPACE}:${PermissionAction.VIEW}`],
  },
]
