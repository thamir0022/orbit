import { Inject, Injectable } from '@nestjs/common'
import { UpdateWorkspaceRoleInput, UpdateWorkspaceRoleOutput } from '../dtos'
import {
  type IRoleRepository,
  ROLE_REPOSITORY,
} from '@/modules/authorization/application/repositories/role.repository'
import { IUpdateWorkspaceRoleUseCase } from './update-workspace-role.interface'
import { RoleNotFoundException } from '@/modules/authorization/domain/exception/authorization.exception'
import { RoleName } from '@/modules/authorization/domain/value-objects/role-name.vo'
import { RoleMapper } from '@/modules/authorization/application/mappers/role.mapper'
import {
  ROLE_PERMISSION_REPOSITORY,
  type RolePermissionRepository,
} from '@/modules/authorization/application/repositories/role-permission.repository'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'

@Injectable()
export class UpdateWorkspaceRoleUseCase implements IUpdateWorkspaceRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(ROLE_PERMISSION_REPOSITORY)
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(
    input: UpdateWorkspaceRoleInput
  ): Promise<UpdateWorkspaceRoleOutput> {
    const role = await this.roleRepository.findById(input.roleId)

    console.log(input.roleId, role)

    if (!role) throw new RoleNotFoundException()

    if (role.workspaceId?.value && role.workspaceId.value !== input.workspaceId)
      throw new RoleNotFoundException()

    role.updateBasicData({
      name: input.name ? RoleName.create(input.name).value : undefined,
      description: input?.description,
      status: input?.status,
    })

    // TODO: Also want to update the role perimission doc

    await this.transactionManager.executeTransaction(async (session) => {
      await this.roleRepository.save(role, { session })
      await this.rolePermissionRepository.replacePermissions(
        input.roleId,
        input.permissionIds
      )
    })

    return {
      role: RoleMapper.toOutputDto(role),
    }
  }
}
