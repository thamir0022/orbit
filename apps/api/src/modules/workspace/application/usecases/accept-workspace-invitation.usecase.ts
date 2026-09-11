import { Inject, Injectable } from '@nestjs/common'
import {
  AcceptWorkspaceInvitationInput,
  AcceptWorkspaceInvitationOutput,
} from '../dtos'
import { IAcceptWorkspaceInvitationUseCase } from './accept-workspace-invitation.interface'
import {
  type IWorkspaceInvitationService,
  WORKSPACE_INVITATION_SERVICE,
} from '../services/workspace-invitation.service.interface'
import {
  type IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../repository/workspace-invitation.repository.interface'
import {
  UserAlreadyWorkspaceMemberException,
  WorkspaceInvitationAlreadyAcceptedException,
  WorkspaceInvitationDeclinedException,
  WorkspaceInvitationEmailMismatchException,
  WorkspaceInvitationExpiredException,
  WorkspaceInvitationNotFoundException,
  WorkspaceInvitationRevokedException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import { WorkspaceInvitationStatus, WorkspaceMember } from '../../domain'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import {
  type IWorkspaceMemberRepository,
  WORKSPACE_MEMBER_REPOSITORY,
} from '../repository/workspace-member.repository.interface'
import {
  type IRoleRepository,
  ROLE_REPOSITORY,
} from '@/modules/authorization/application/repositories/role.repository'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import { AccountNotFoundException, UserId } from '@/modules/user/domain'
import { RoleNotFoundException } from '@/modules/authorization/domain/exception/authorization.exception'

@Injectable()
export class AcceptWorkspaceInvitationUseCase implements IAcceptWorkspaceInvitationUseCase {
  constructor(
    @Inject(WORKSPACE_INVITATION_SERVICE)
    private readonly invitationService: IWorkspaceInvitationService,

    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,

    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,

    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,

    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute(
    input: AcceptWorkspaceInvitationInput
  ): Promise<AcceptWorkspaceInvitationOutput> {
    const tokenHash = this.invitationService.hashToken(input.token)

    const invitation =
      await this.invitationRepository.findByTokenHash(tokenHash)

    if (!invitation) {
      throw new WorkspaceInvitationNotFoundException()
    }

    if (invitation.isExpired()) {
      throw new WorkspaceInvitationExpiredException()
    }

    switch (invitation.status) {
      case WorkspaceInvitationStatus.ACCEPTED:
        throw new WorkspaceInvitationAlreadyAcceptedException()

      case WorkspaceInvitationStatus.REVOKED:
        throw new WorkspaceInvitationRevokedException()

      case WorkspaceInvitationStatus.DECLINED:
        throw new WorkspaceInvitationDeclinedException()
    }

    const userIdResult = UserId.fromString(input.userId)

    const user = await this.userRepository.findById(userIdResult)

    if (!user) throw new AccountNotFoundException()

    if (user.email.value !== invitation.email.value)
      throw new WorkspaceInvitationEmailMismatchException()

    const workspace = await this.workspaceRepository.findById(
      invitation.workspaceId
    )

    if (!workspace) throw new WorkspaceNotFoundException()

    const role = await this.roleRepository.findById(invitation.roleId.value)

    if (!role) throw new RoleNotFoundException()

    const isMember = await this.workspaceMemberRepository.exists({
      workspaceId: invitation.workspaceId,
      userId: user.userId,
    })

    if (isMember) throw new UserAlreadyWorkspaceMemberException()

    const member = WorkspaceMember.create({
      workspaceId: invitation.workspaceId,
      userId: user.userId,
      roleId: role.id,
      invitedAt: invitation.createdAt,
      invitedBy: invitation.invitedBy.value,
    })

    invitation.accept(user.email)

    await this.transactionManager.executeTransaction(async (session) => {
      await this.workspaceMemberRepository.save(member, {
        session,
      })

      await this.invitationRepository.save(invitation, {
        session,
      })
    })

    return {
      workspaceSlug: workspace.slug,
    }
  }
}
