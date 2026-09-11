import {
  type IRoleRepository,
  ROLE_REPOSITORY,
} from '@/modules/authorization/application/repositories/role.repository'
import { GetWorkspaceRolesInput, GetWorkspaceRolesOutput } from '../dtos'
import { IGetWorkspaceRoles } from './get-workspace-roles.interface'
import { Inject, Injectable } from '@nestjs/common'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import { WorkspaceId, WorkspaceStatus } from '../../domain'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import { RoleName } from '@/modules/authorization/domain/value-objects/role-name.vo'
import { RoleMapper } from '@/modules/authorization/application/mappers/role.mapper'
import { RoleStatus } from '@/modules/authorization/domain/enums/role-status.enum'
import { Role } from '@/modules/authorization/domain/entities/role.entity'

interface FetchRolesParams {
  workspaceId: WorkspaceId
  type: 'all' | 'assignable'
  name?: RoleName
  status?: RoleStatus
}

@Injectable()
export class GetWorkspaceRoles implements IGetWorkspaceRoles {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository
  ) {}

  async execute(
    input: GetWorkspaceRolesInput
  ): Promise<GetWorkspaceRolesOutput> {
    const workspaceId = WorkspaceId.fromString(input.workspaceId)

    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const roles = await this.getRoles({ workspaceId, type: input.type })

    return {
      roles: roles.map((role) => RoleMapper.toOutputDto(role)),
    }
  }

  private async getRoles(params: FetchRolesParams): Promise<Role[]> {
    if (params.type === 'all') {
      return await this.roleRepository.findByWorkspaceId(params.workspaceId, {
        name: params?.name,
        status: params.status,
      })
    } else {
      return await this.roleRepository.findAssignableRoles(params.workspaceId)
    }
  }
}
