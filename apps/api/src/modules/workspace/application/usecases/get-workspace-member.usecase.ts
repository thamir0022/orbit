import { Inject, Injectable } from '@nestjs/common'
import { GetWorkspaceMemberInput, GetWorkspaceMemberOutput } from '../dtos'
import { IGetWorkspaceMemberUseCase } from './get-workspace-member.interface'
import { WorkspaceId } from '../../domain'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'
import { UserId } from '@/modules/user/domain'
import { WorkspaceMemberNotFoundException } from '../../domain/exceptions/workspace.exception'

@Injectable()
export class GetWorkspaceMemberUseCase implements IGetWorkspaceMemberUseCase {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository
  ) {}

  async execute(
    input: GetWorkspaceMemberInput
  ): Promise<GetWorkspaceMemberOutput> {
    const workspaceId = WorkspaceId.fromString(input.workspaceId)
    const memberId = UserId.fromString(input.memberId)

    const member = await this.workspaceMemberRepository.findMember({
      workspaceId,
      memberId,
    })

    if (!member) throw new WorkspaceMemberNotFoundException()

    return {
      member,
    }
  }
}
