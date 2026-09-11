import { Inject, Logger } from '@nestjs/common'
import { GetWorkspaceMembersInput, GetWorkspaceMembersOutput } from '../dtos'
import { IGetWorkspaceMembersUseCase } from './get-workspace-members.interface'
import {
  WORKSPACE_REPOSITORY,
  type IWorkspaceRepository,
} from '../repository/workspace.repository.interface'
import { WorkspaceId, WorkspaceStatus } from '../../domain'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'

export class GetWorkspaceMembersUseCase implements IGetWorkspaceMembersUseCase {
  private readonly logger = new Logger(GetWorkspaceMembersUseCase.name)

  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository
  ) {}

  async execute({
    workspaceId,
    limit,
    page,
    roleId,
    search,
    status,
  }: GetWorkspaceMembersInput): Promise<GetWorkspaceMembersOutput> {
    const workspaceIdResult = WorkspaceId.fromString(workspaceId)

    const workspace = await this.workspaceRepository.findById(workspaceIdResult)

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const { data: workspaceMembers, meta } =
      await this.workspaceMemberRepository.findAll({
        workspaceId,
        limit,
        page,
        roleId,
        search,
        status,
      })

    return {
      workspaceMembers,
      meta,
    }
  }
}
