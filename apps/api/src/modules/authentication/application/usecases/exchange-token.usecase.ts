import {
  ForbiddenException,
  Inject,
  Logger,
  UnauthorizedException,
} from '@nestjs/common'
import { ExchangeTokenInputDto, ExchangeTokenOutputDto } from '../dto'
import { IExchangeTokenUseCase } from './exchange-token.interface'
import {
  WORKSPACE_REPOSITORY,
  type IWorkspaceRepository,
} from '@/modules/workspace/application'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  ROLE_PERMISSION_REPOSITORY,
  type RolePermissionRepository,
} from '@/modules/authorization/application/repositories/role-permission.repository'
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/modules/user/application'
import {
  AccountInactiveException,
  AccountNotFoundException,
  UserId,
  UserStatus,
} from '@/modules/user/domain'
import {
  type IRoleRepository,
  ROLE_REPOSITORY,
} from '@/modules/authorization/application/repositories/role.repository'
import {
  USER_ROLE_REPOSITORY,
  type UserRoleRepository,
} from '@/modules/authorization/application/repositories/user-role.repository'
import { Workspace } from '@/modules/workspace/domain'
import { WorkspaceMapper } from '@/modules/workspace/application/mappers/workspace.mapper'

export class ExchangeTokenUseCase implements IExchangeTokenUseCase {
  private readonly logger = new Logger(ExchangeTokenUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(ROLE_PERMISSION_REPOSITORY)
    private readonly rolePermissionRepository: RolePermissionRepository,

    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(USER_ROLE_REPOSITORY)
    private readonly userRoleRepository: UserRoleRepository
  ) {}

  async execute({
    sid,
    userId,
    slug,
  }: ExchangeTokenInputDto): Promise<ExchangeTokenOutputDto> {
    const userIdValue = UserId.create(userId)

    this.logger.debug(
      `Token exchange started: user=${userId}, workspace=${slug ?? 'none'}`
    )

    const user = await this.userRepository.findById(userIdValue)

    if (!user) {
      throw new AccountNotFoundException()
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AccountInactiveException(user.status)
    }

    const session = await this.authService.getSession(sid)

    console.log('SESSION : ', session)

    if (!session)
      throw new UnauthorizedException('Session is expired sign in again')

    const isSystemUser = await this.authService.isSystemUser(userIdValue.value)

    const { workspace, roleId, permissionKeys } =
      await this.resolveAuthorizationContext({
        userId: userIdValue,
        slug,
        isSystemUser,
      })

    const accessToken = await this.authService.createAccessToken({
      sid: session.sid,
      jti: this.authService.generateSecureToken(),
      sub: user.id.value,
      ...(workspace?.id && {
        tid: workspace.id.value,
      }),
    })

    await this.authService.cachePermissions(roleId, permissionKeys)

    const expiresIn = this.authService.extractTokenExpiry(accessToken)

    return {
      ...(workspace && {
        workspace: WorkspaceMapper.toOutputDto(workspace),
      }),
      accessToken,
      expiresIn,
    }
  }

  private async resolveAuthorizationContext(input: {
    userId: UserId
    slug?: string
    isSystemUser: boolean
  }): Promise<AuthorizationContext> {
    const { userId, slug, isSystemUser } = input

    if (isSystemUser && !slug) {
      const systemUserDetails =
        await this.userRoleRepository.findRoleDetailsByUserId(userId)

      if (!systemUserDetails) {
        throw new Error('Platform admin system role is not configured')
      }

      const permissionKeys =
        await this.rolePermissionRepository.findPermissionKeysByRoleId(
          systemUserDetails.roleId
        )

      return {
        roleId: systemUserDetails.roleId,
        permissionKeys,
      }
    }

    if (!slug) {
      throw new ForbiddenException(
        'Workspace slug is required for tenant access.'
      )
    }

    const workspaceContext =
      await this.workspaceRepository.findActiveContextBySlug({
        slug,
        userId,
      })

    if (!workspaceContext) {
      this.logger.warn(
        `Workspace access denied: user=${userId.value}, workspace=${slug}`
      )

      throw new ForbiddenException('You do not have access to this workspace.')
    }

    const permissionKeys =
      await this.rolePermissionRepository.findPermissionKeysByRoleId(
        workspaceContext.roleId
      )

    return {
      workspace: workspaceContext.workspace,
      roleId: workspaceContext.roleId,
      permissionKeys,
    }
  }
}

interface AuthorizationContext {
  readonly workspace?: Workspace
  readonly roleId: string
  readonly permissionKeys: string[]
}
