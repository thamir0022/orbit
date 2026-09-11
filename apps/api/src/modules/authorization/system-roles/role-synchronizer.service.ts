import { Inject, Injectable, Logger } from '@nestjs/common'

import { SYSTEM_ROLES } from './system-role-catalog'
import { SystemRoleDefinition } from './system-role-definition.interface'

import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '../application/repositories/role.repository'

import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../application/repositories/permission.repository'

import {
  ROLE_PERMISSION_REPOSITORY,
  type RolePermissionRepository,
} from '../application/repositories/role-permission.repository'

import { Role } from '../domain/entities/role.entity'
import { RoleName } from '../domain/value-objects/role-name.vo'
import { PermissionKey } from '../domain/value-objects/permission-key.vo'

@Injectable()
export class RoleSynchronizerService {
  private readonly logger = new Logger(RoleSynchronizerService.name)

  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,

    @Inject(ROLE_PERMISSION_REPOSITORY)
    private readonly rolePermissionRepository: RolePermissionRepository
  ) {}

  async synchronize(): Promise<void> {
    this.logger.log(`Synchronizing ${SYSTEM_ROLES.length} roles`)

    for (const definition of SYSTEM_ROLES) {
      await this.synchronizeRole(definition)
    }

    this.logger.log(
      `Role synchronization completed (${SYSTEM_ROLES.length} roles)`
    )
  }

  private async synchronizeRole(
    definition: SystemRoleDefinition
  ): Promise<void> {
    const roleNameResult = RoleName.create(definition.name)

    if (roleNameResult.isFailure) {
      throw new Error(roleNameResult.error)
    }

    let role = await this.roleRepository.findSystemRoleByName(
      roleNameResult.value
    )

    if (!role) {
      role = Role.create({
        name: roleNameResult.value,
        description: definition.description,
        scope: definition.scope,
        isPredefined: true,
        workspaceId: undefined,
      })

      await this.roleRepository.save(role)

      this.logger.log(`Created role: ${definition.name}`)
    }

    await this.synchronizeRolePermissions(role.id.value, definition.permissions)
  }

  private async synchronizeRolePermissions(
    roleId: string,
    permissionKeys: string[]
  ): Promise<void> {
    if (permissionKeys.includes('*')) {
      const permissions = await this.permissionRepository.findAll({})

      await this.rolePermissionRepository.replacePermissions(
        roleId,
        permissions.map((permission) => permission.permissionId.value)
      )

      return
    }

    const permissionIds: string[] = []

    for (const key of permissionKeys) {
      const permissionKeyResult = PermissionKey.create(key)

      if (permissionKeyResult.isFailure)
        throw new Error(permissionKeyResult.error)

      const permission = await this.permissionRepository.findByKey(
        permissionKeyResult.value
      )

      if (!permission) {
        throw new Error(`Permission not found: ${key}`)
      }

      permissionIds.push(permission.permissionId.value)
    }

    await this.rolePermissionRepository.replacePermissions(
      roleId,
      permissionIds
    )
  }
}
