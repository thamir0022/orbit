import { Inject, Injectable } from '@nestjs/common'
import {
  GetWorkspaceInvitationInput,
  GetWorkspaceInvitationOutput,
  WorkspaceInvitationAction,
} from '../dtos'
import {
  type IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '../repository/workspace-invitation.repository.interface'
import { IGetWorkspaceInvitationUseCase } from './get-workspace-invitation.interface'
import { WorkspaceInvitationStatus } from '../../domain'
import {
  type IWorkspaceInvitationService,
  WORKSPACE_INVITATION_SERVICE,
} from '../services/workspace-invitation.service.interface'
import {
  WorkspaceInvitationAlreadyAcceptedException,
  WorkspaceInvitationDeclinedException,
  WorkspaceInvitationExpiredException,
  WorkspaceInvitationNotFoundException,
  WorkspaceInvitationRevokedException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import { RoleNotFoundException } from '@/modules/authorization/domain/exception/authorization.exception'
import {
  type IRoleRepository,
  ROLE_REPOSITORY,
} from '@/modules/authorization/application/repositories/role.repository'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'

@Injectable()
export class GetWorkspaceInvitationUseCase implements IGetWorkspaceInvitationUseCase {
  constructor(
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    @Inject(WORKSPACE_INVITATION_SERVICE)
    private readonly invitationService: IWorkspaceInvitationService,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}

  async execute({
    token,
  }: GetWorkspaceInvitationInput): Promise<GetWorkspaceInvitationOutput> {
    const tokenHash = this.invitationService.hashToken(token)

    const invitation =
      await this.invitationRepository.findByTokenHash(tokenHash)

    if (!invitation) throw new WorkspaceInvitationNotFoundException()

    if (invitation.isExpired()) throw new WorkspaceInvitationExpiredException()

    switch (invitation.status) {
      case WorkspaceInvitationStatus.REVOKED:
        throw new WorkspaceInvitationRevokedException()

      case WorkspaceInvitationStatus.ACCEPTED:
        throw new WorkspaceInvitationAlreadyAcceptedException()

      case WorkspaceInvitationStatus.DECLINED:
        throw new WorkspaceInvitationDeclinedException()
    }

    const [workspace, role, inviter, isExistingUser] = await Promise.all([
      this.workspaceRepository.findById(invitation.workspaceId),
      this.roleRepository.findById(invitation.roleId.value),
      this.userRepository.findById(invitation.invitedBy),
      this.userRepository.existsByEmail(invitation.email),
    ])

    if (!workspace) throw new WorkspaceNotFoundException()

    if (
      !role ||
      (!role.isPredefined && invitation.workspaceId.equals(role.workspaceId))
    )
      throw new RoleNotFoundException()

    return {
      workspaceName: workspace.name,
      workspaceSlug: workspace.slug,
      workspaceLogoUrl: workspace.settings.logoUrl,
      inviterName: inviter?.displayName ?? `${workspace.name} Admin`,
      roleName: role.name.value,
      expiresAt: invitation.expiresAt,
      action: isExistingUser
        ? WorkspaceInvitationAction.SIGN_IN
        : WorkspaceInvitationAction.SIGN_UP,
    }
  }
}
