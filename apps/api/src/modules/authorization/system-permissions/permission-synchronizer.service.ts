import { Inject, Injectable, Logger } from '@nestjs/common'

import { SYSTEM_PERMISSIONS } from './permission-catalog'
import { PermissionDefinition } from './permission-definition.interface'
import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../application/repositories/permission.repository'
import { PermissionKey } from '../domain/value-objects/permission-key.vo'
import { Permission } from '../domain/entities/permission.entity'

@Injectable()
export class PermissionSynchronizerService {
  private readonly logger = new Logger(PermissionSynchronizerService.name)

  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async synchronize(): Promise<void> {
    this.logger.log(`Synchronizing ${SYSTEM_PERMISSIONS.length} permissions`)

    for (const definition of SYSTEM_PERMISSIONS) {
      await this.synchronizePermission(definition)
    }

    this.logger.log(
      `Permission synchronization completed (${SYSTEM_PERMISSIONS.length} permissions)`
    )
  }

  private async synchronizePermission(
    definition: PermissionDefinition
  ): Promise<void> {
    const key = PermissionKey.create(
      `${definition.resource}:${definition.action}`
    )

    if (key.isFailure) {
      throw new Error(key.error)
    }

    const existing = await this.permissionRepository.findByKey(key.value)

    if (!existing) {
      const permission = Permission.create({
        key: key.value,
        resource: definition.resource,
        action: definition.action,
        description: definition.description,
      })

      await this.permissionRepository.save(permission)

      this.logger.log(`Created permission: ${key.value.value}`)

      return
    }

    const needsUpdate =
      existing.description !== definition.description ||
      existing.action !== definition.action ||
      existing.resource !== definition.resource

    if (!needsUpdate) {
      return
    }

    existing.updateMetadata({
      resource: definition.resource,
      action: definition.action,
      description: definition.description,
    })

    await this.permissionRepository.save(existing)

    this.logger.log(`Updated permission: ${key.value.value}`)
  }
}
