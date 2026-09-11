import { UserId } from '@/modules/user/domain'
import { WorkspaceId } from '@/modules/workspace/domain'
import { type RoleDocument } from '../../infrastructure/schemas/role.schema'
import { RoleDto } from '../models/role.dto'
import { Role } from '../../domain/entities/role.entity'
import { RoleProps } from '../../domain/interfaces/role.props'
import { RoleId } from '../../domain/value-objects/role-id.vo'
import { RoleName } from '../../domain/value-objects/role-name.vo'
import { RoleStatus } from '../../domain/enums/role-status.enum'

export class RoleMapper {
  static toOutputDto(role: Role): RoleDto {
    return {
      id: role.id.value,
      workspaceId: role.id.value,
      name: role.name.value,
      description: role.description,
      scope: role.scope,
      isPredefined: role.isPredefined,
      status: role.status,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  }

  static toPersistence(role: Role): Partial<RoleDocument> {
    return {
      id: role.id.value,
      workspaceId: role.workspaceId?.value,
      name: role.name.value,
      description: role.description,
      scope: role.scope,
      isPredefined: role.isPredefined,
      status: role.status,
      createdBy: role.createdBy?.value,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  }

  static toDomain(document: RoleDocument): Role {
    const props: RoleProps = {
      id: RoleId.fromString(document.id),
      workspaceId: WorkspaceId.fromString(document.workspaceId),
      name: RoleName.create(document.name).value,
      description: document.description,
      isPredefined: document.isPredefined,
      scope: document.scope,
      status: document.status as RoleStatus,
      createdBy: UserId.fromString(document.createdBy),
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
      deletedAt: document.deletedAt,
    }

    return Role.reconstitute(props)
  }
}
