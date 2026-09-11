import { Inject, Injectable, Logger } from '@nestjs/common'
import {
  PERMISSION_REPOSITORY,
  type PermissionRepository,
} from '@/modules/authorization/application/repositories/permission.repository'
import { PermissionResource } from '@/modules/authorization/domain/enums/permission-resource.enum'
import { GetWorkspacePermissionOutput } from '../dtos'
import { IGetWorkspacePermissionsUseCase } from './get-workspace-permissions.interface'
import { PermissionMapper } from '@/modules/authorization/application/mappers/permission.mapper'

@Injectable()
export class GetWOrkspacePermissionsUseCase implements IGetWorkspacePermissionsUseCase {
  private readonly logger = new Logger(GetWOrkspacePermissionsUseCase.name)
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository
  ) {}

  async execute(): Promise<GetWorkspacePermissionOutput> {
    const permissions = await this.permissionRepository.findAll({
      resourse: PermissionResource.WORKSPACE,
    })

    return {
      permissions: permissions.map((permission) =>
        PermissionMapper.toOutputDto(permission)
      ),
    }
  }
}
