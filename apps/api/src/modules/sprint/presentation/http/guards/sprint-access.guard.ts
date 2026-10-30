import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common'
import { AuthenticatedRequest } from '@/shared/domain/types'
import { UserId } from '@/modules/user/domain'
import {
  WorkspaceId,
  WorkspaceMemberStatus,
  WorkspaceStatus,
} from '@/modules/workspace/domain'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  IWorkspaceMemberRepository,
} from '@/modules/workspace/application/repository/workspace-member.repository.interface'
import {
  WORKSPACE_REPOSITORY,
  IWorkspaceRepository,
} from '@/modules/workspace/application'

@Injectable()
export class SprintAccessGuard implements CanActivate {
  constructor(
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly members: IWorkspaceMemberRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaces: IWorkspaceRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { auth, method } = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>()
    if (!auth?.workspaceId || !auth.userId)
      throw new ForbiddenException(
        'An active workspace membership is required.'
      )
    const workspaceId = WorkspaceId.create(auth.workspaceId)
    // Recheck membership so removed members cannot use a stale session.
    const member = await this.members.findMember({
      workspaceId,
      memberId: UserId.create(auth.userId),
    })
    if (member?.status !== WorkspaceMemberStatus.ACTIVE)
      throw new ForbiddenException(
        'An active workspace membership is required.'
      )
    if (method !== 'GET' && method !== 'HEAD') {
      const workspace = await this.workspaces.findById(workspaceId)
      if (workspace?.status !== WorkspaceStatus.ACTIVE)
        throw new ForbiddenException(
          'The workspace must be active to change sprints.'
        )
    }
    return true
  }
}
