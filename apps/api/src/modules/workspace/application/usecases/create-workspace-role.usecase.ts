import { Inject, Injectable } from '@nestjs/common'
import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '../../../authorization/application/repositories/role.repository'
import { RoleName } from '../../../authorization/domain/value-objects/role-name.vo'
import { Role } from '../../../authorization/domain/entities/role.entity'
import { WorkspaceId } from '@/modules/workspace/domain'
import {
  InvalidPermissionException,
  InvalidRoleNameException,
  RoleAlreadyExistsException,
} from '../../../authorization/domain/exception/authorization.exception'
import { RoleMapper } from '../../../authorization/application/mappers/role.mapper'
import { RoleScope } from '../../../authorization/domain/enums/role-scope.enum'
import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '../../../authorization/application/repositories/permission.repository'
import {
  ROLE_PERMISSION_REPOSITORY,
  type RolePermissionRepository,
} from '../../../authorization/application/repositories/role-permission.repository'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import { PermissionId } from '../../../authorization/domain/value-objects/permission-id.vo'
import { RolePermission } from '../../../authorization/domain/entities/role-permission.entity'
import { ICreateWorkspaceRoleUseCase } from './create-workspace-role.interface'
import { CreateWorkspaceRoleInput, CreateWorkspaceRoleOutput } from '../dtos'

@Injectable()
export class CreateWorkspaceRoleUseCase implements ICreateWorkspaceRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,

    @Inject(ROLE_PERMISSION_REPOSITORY)
    private readonly rolePermissionRepository: RolePermissionRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(
    input: CreateWorkspaceRoleInput
  ): Promise<CreateWorkspaceRoleOutput> {
    const roleNameResult = RoleName.create(input.name)

    if (roleNameResult.isFailure) {
      throw new InvalidRoleNameException(roleNameResult.error)
    }

    const workspaceId = WorkspaceId.fromString(input.workspaceId)

    const exists = await this.roleRepository.findByName(
      workspaceId,
      roleNameResult.value
    )

    if (exists) {
      throw new RoleAlreadyExistsException(roleNameResult.value)
    }

    const permissionIds = input.permissionIds.map((id) =>
      PermissionId.fromString(id)
    )

    const permissions = await this.permissionRepository.findByIds(permissionIds)

    if (permissions.length !== permissionIds.length) {
      throw new InvalidPermissionException()
    }

    const role = Role.create({
      workspaceId,
      name: roleNameResult.value,
      description: input.description,
      scope: RoleScope.WORKSPACE,
      isPredefined: false,
    })

    const rolePermissions = permissionIds.map((permissionId) =>
      RolePermission.create({
        roleId: role.id,
        permissionId,
      })
    )

    await this.transactionManager.executeTransaction(async (session) => {
      await this.roleRepository.save(role, { session })

      await this.rolePermissionRepository.saveMany(rolePermissions, { session })
    })

    return {
      role: RoleMapper.toOutputDto(role),
    }
  }
}
