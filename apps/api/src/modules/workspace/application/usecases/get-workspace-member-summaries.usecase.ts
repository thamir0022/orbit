import { Inject, Injectable } from '@nestjs/common'
import { WorkspaceId, WorkspaceStatus } from '../../domain'
import {
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import {
  WORKSPACE_REPOSITORY,
  type IWorkspaceRepository,
} from '../repository/workspace.repository.interface'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  type IWorkspaceMemberRepository,
} from '../repository/workspace-member.repository.interface'
import {
  GetWorkspaceMemberSummariesInput,
  GetWorkspaceMemberSummariesOutput,
  IGetWorkspaceMemberSummariesUseCase,
} from './get-workspace-member-summaries.interface'

/** Validates the workspace before reading paginated member identities. */
@Injectable()
export class GetWorkspaceMemberSummariesUseCase implements IGetWorkspaceMemberSummariesUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly memberRepository: IWorkspaceMemberRepository
  ) {}

  async execute(
    input: GetWorkspaceMemberSummariesInput
  ): Promise<GetWorkspaceMemberSummariesOutput> {
    const workspace = await this.workspaceRepository.findById(
      WorkspaceId.fromString(input.workspaceId)
    )
    if (!workspace) throw new WorkspaceNotFoundException()
    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const { data, meta } = await this.memberRepository.findSummaries(input)
    return { workspaceMembers: data, meta }
  }
}
