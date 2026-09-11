import { Inject, Injectable, Logger } from '@nestjs/common'
import { UpdateWorkspaceMemberInput } from '../dtos'
import { UpdateWorkspaceMemberOutput } from '../dtos/outputs/update-workspace-member.output.dto'
import { IUpdateWorkspaceMemberUseCase } from './update-workspace-member.interface'
import { WorkspaceId, WorkspaceMember } from '../../domain'
import { UserId } from '@/modules/user/domain'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'
import { WorkspaceMemberNotFoundException } from '../../domain/exceptions/workspace.exception'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'

@Injectable()
export class UpdateWorkspaceMemberUsecase implements IUpdateWorkspaceMemberUseCase {
  private readonly logger = new Logger(UpdateWorkspaceMemberUsecase.name)

  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository
  ) {}

  async execute(
    input: UpdateWorkspaceMemberInput
  ): Promise<UpdateWorkspaceMemberOutput> {
    const workspaceId = WorkspaceId.fromString(input.workspaceId)

    const memberId = UserId.fromString(input.memberId)

    const member = await this.workspaceMemberRepository.findMember({
      workspaceId,
      memberId,
    })

    if (!member) throw new WorkspaceMemberNotFoundException()

    this.logger.debug(member)

    const workspaceMember = WorkspaceMember.create({
      id: member.id,
      workspaceId,
      userId: memberId,
      roleId: RoleId.fromString(member.roleId),
      status: member.status,
    })

    if (input.status) workspaceMember.changeStatus(input.status)
    if (input.roleId) workspaceMember.changeRole(input.roleId)

    await this.workspaceMemberRepository.save(workspaceMember)

    return {
      member: {
        id: workspaceMember.id,
        displayName: member.displayName,
        email: member.email,
        roleId: member.roleId,
        roleName: member.roleName,
        status: workspaceMember.status,
        avatarUrl: member.avatarUrl,
        joinedAt: workspaceMember.joinedAt,
      },
    }
  }
}
