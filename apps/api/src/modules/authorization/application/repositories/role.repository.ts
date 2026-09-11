import { Role } from '../../domain/entities/role.entity'
import { IBaseRepository } from '@/shared/application/ports/base.repository.interface'
import { RoleName } from '../../domain/value-objects/role-name.vo'
import { WorkspaceId } from '@/modules/workspace/domain'
import { RoleStatus } from '../../domain/enums/role-status.enum'

export interface FindWorkspaceRoleQuery {
  name?: RoleName
  status?: RoleStatus
}

export interface IRoleRepository extends IBaseRepository<Role, string> {
  findByWorkspaceId(
    workspaceId: WorkspaceId,
    query?: FindWorkspaceRoleQuery
  ): Promise<Role[]>
  findByName(workspaceId: WorkspaceId, roleName: RoleName): Promise<Role | null>
  findSystemRoleByName(roleName: RoleName): Promise<Role | null>
  findAssignableRoles(workspaceId: WorkspaceId): Promise<Role[]>
}

export const ROLE_REPOSITORY = Symbol('RoleRepository')
