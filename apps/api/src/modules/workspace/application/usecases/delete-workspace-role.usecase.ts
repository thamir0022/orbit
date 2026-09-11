import { Inject, Injectable } from '@nestjs/common'
import { DeleteWorkspaceRoleInput } from '../dtos'
import { IDeleteWorkspaceRoleUseCase } from './delete-workspace-role.interface'
import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '@/modules/authorization/application/repositories/role.repository'
import { RoleNotFoundException } from '@/modules/authorization/domain/exception/authorization.exception'
import {
  ROLE_PERMISSION_REPOSITORY,
  type RolePermissionRepository,
} from '@/modules/authorization/application/repositories/role-permission.repository'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import { SystemRole } from '@/modules/authorization/domain/enums/system-role.enum'
import { RoleName } from '@/modules/authorization/domain/value-objects/role-name.vo'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'

@Injectable()
export class DeleteWorkspaceUseCase implements IDeleteWorkspaceRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    @Inject(ROLE_PERMISSION_REPOSITORY)
    private readonly rolePermissionRepository: RolePermissionRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(input: DeleteWorkspaceRoleInput): Promise<void> {
    const role = await this.roleRepository.findById(input.roleId)

    if (!role) throw new RoleNotFoundException()

    if (role.workspaceId?.value !== input.workspaceId)
      throw new RoleNotFoundException()

    const memberRole = await this.roleRepository.findSystemRoleByName(
      RoleName.create(SystemRole.MEMBER).value
    )

    if (!memberRole) throw new RoleNotFoundException()

    await this.transactionManager.executeTransaction(async (session) => {
      await this.roleRepository.delete(role.id.value, { session })

      await this.rolePermissionRepository.deleteMany(role.id, { session })

      await this.workspaceMemberRepository.replaceRole(role.id, memberRole.id, {
        session,
      })
    })
  }
}
