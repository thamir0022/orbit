import { Inject, Injectable } from '@nestjs/common'
import { RemoveWorkspaceMemberInput } from '../dtos'
import { IRemoveWorkspaceMemberUseCase } from './remove-workspace-member.interface'
import { UserId } from '@/modules/user/domain'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'
import { WorkspaceId } from '../../domain'
import { WorkspaceMemberNotFoundException } from '../../domain/exceptions/workspace.exception'

@Injectable()
export class RemoveWorkspaceMemberUseCase implements IRemoveWorkspaceMemberUseCase {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository
  ) {}

  async execute(input: RemoveWorkspaceMemberInput): Promise<void> {
    const workspaceId = WorkspaceId.fromString(input.workspaceId)
    const memberId = UserId.fromString(input.memberId)

    const member = await this.workspaceMemberRepository.findMember({
      workspaceId,
      memberId,
    })

    if (!member) throw new WorkspaceMemberNotFoundException()

    await this.workspaceMemberRepository.delete(member.id)
  }
}
