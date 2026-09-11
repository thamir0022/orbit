import { Permission } from '../../domain/entities/permission.entity'
import { PermissionProps } from '../../domain/interfaces/permission.props'
import { PermissionId } from '../../domain/value-objects/permission-id.vo'
import { PermissionKey } from '../../domain/value-objects/permission-key.vo'
import { PermissionDocument } from '../../infrastructure/schemas/permission.schema'
import { PermissionDto } from '../models/permission.dto'

export class PermissionMapper {
  static toOutputDto(permission: Permission): PermissionDto {
    return {
      id: permission.permissionId.value,

      key: permission.key.value,

      resource: permission.resource,

      action: permission.action,

      description: permission.description,

      status: permission.status,

      createdAt: permission.createdAt,

      updatedAt: permission.updatedAt,
    }
  }

  static toPersistence(permission: Permission): Partial<PermissionDocument> {
    return {
      id: permission.permissionId.value,

      key: permission.key.value,

      resource: permission.resource,

      action: permission.action,

      description: permission.description,

      status: permission.status,

      createdAt: permission.createdAt,

      updatedAt: permission.updatedAt,
    }
  }

  static toDomain(document: PermissionDocument): Permission {
    const props: PermissionProps = {
      id: PermissionId.fromString(document.id),

      key: PermissionKey.create(document.key).value,

      resource: document.resource,

      action: document.action,

      description: document.description,

      status: document.status,

      createdAt: document.createdAt,

      updatedAt: document.updatedAt,
    }

    return Permission.reconstitute(props)
  }
}
