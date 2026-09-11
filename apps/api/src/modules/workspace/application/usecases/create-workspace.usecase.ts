import { Inject, Logger } from '@nestjs/common'
import { CreateWorkspaceInput, CreateWorkspaceOutput } from '../dtos'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import { ICreateWorkspaceUseCase } from './create-workspace.interface'
import { WorkspaceAlreadyExistsException } from '../../domain/exceptions/workspace.exception'
import { Workspace, WorkspaceMember } from '../../domain'
import { UserId } from '@/modules/user/domain'
import {
  ROLE_REPOSITORY,
  type IRoleRepository,
} from '@/modules/authorization/application/repositories/role.repository'
import { RoleName } from '@/modules/authorization/domain/value-objects/role-name.vo'
import { SystemRole } from '@/modules/authorization/domain/enums/system-role.enum'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'
import { WorkspaceMapper } from '../mappers/workspace.mapper'

export class CreateWorkspaceUseCase implements ICreateWorkspaceUseCase {
  private readonly logger = new Logger()

  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({
    name,
    slug,
    companySize,
    companyType,
    userId,
  }: CreateWorkspaceInput): Promise<CreateWorkspaceOutput> {
    const userIdResult = UserId.create(userId)
    const existingWorkspace = await this.workspaceRepository.findBySlug(slug)

    if (existingWorkspace) throw new WorkspaceAlreadyExistsException(slug)

    const workspace = Workspace.create({
      name,
      slug,
      companySize,
      companyType,
      defaultPlanId: '019c74bd-9862-7369-b600-0eed36827f90', // TODO: Resolve via Default Plan Service
      ownerId: userIdResult,
    })

    const workspaceAdmin = RoleName.create(SystemRole.PLATFORM_ADMIN)

    const workspaceAdminRole = await this.roleRepository.findSystemRoleByName(
      workspaceAdmin.value
    )

    if (!workspaceAdminRole) {
      this.logger.error('Default Work Space Admin role is not found!')
      throw new Error(
        'Something went wrong while creating work space, Please try again later'
      )
    }

    const workspacemember = WorkspaceMember.create({
      userId: userIdResult,
      workspaceId: workspace.id,
      roleId: workspaceAdminRole?.id,
    })

    await this.transactionManager.executeTransaction(async (session) => {
      await this.workspaceRepository.save(workspace, { session })
      await this.workspaceMemberRepository.save(workspacemember, { session })
    })

    return { workspace: WorkspaceMapper.toOutputDto(workspace) }
  }
}
