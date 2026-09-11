import {
  AccountNotFoundException,
  Email,
  InvalidEmailException,
  UserId,
} from '@/modules/user/domain'
import {
  InviteWorkspaceMemberInput,
  InviteWorkspaceMemberOutput,
} from '../dtos'
import { IInviteWorkspaceMemberUseCase } from './invite-workspace-member.interface'
import { WorkspaceId } from '../../domain'
import { RoleId } from '@/modules/authorization/domain/value-objects/role-id.vo'
import {
  type IWorkspaceRepository,
  WORKSPACE_REPOSITORY,
} from '../repository/workspace.repository.interface'
import { Inject } from '@nestjs/common'
import {
  UserAlreadyWorkspaceMemberException,
  WorkspaceInvitationAlreadyExistsException,
  WorkspaceNotFoundException,
} from '../../domain/exceptions/workspace.exception'
import {
  type IRoleRepository,
  ROLE_REPOSITORY,
} from '@/modules/authorization/application/repositories/role.repository'
import { RoleNotFoundException } from '@/modules/authorization/domain/exception/authorization.exception'
import {
  WORKSPACE_INVITATION_REPOSITORY,
  type IWorkspaceInvitationRepository,
} from '../repository/workspace-invitation.repository.interface'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import { WorkspaceInvitation } from '../../domain/entities/workspace-invitation.entity'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import {
  type IMailService,
  MAIL_SERVICE,
} from '@/modules/mail/domain/ports/mail-service.port'
import {
  type IWorkspaceInvitationService,
  WORKSPACE_INVITATION_SERVICE,
} from '../services/workspace-invitation.service.interface'

export class InviteWorkspaceMemberUseCase implements IInviteWorkspaceMemberUseCase {
  constructor(
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: IRoleRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly invitationRepository: IWorkspaceInvitationRepository,
    @Inject(WORKSPACE_INVITATION_SERVICE)
    private readonly invitationService: IWorkspaceInvitationService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionmanager: ITransactionManager,
    @Inject(MAIL_SERVICE)
    private readonly mailService: IMailService
  ) {}

  async execute(
    input: InviteWorkspaceMemberInput
  ): Promise<InviteWorkspaceMemberOutput> {
    const emailResult = Email.create(input.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const workspaceId = WorkspaceId.fromString(input.workspaceId)
    const inviterId = UserId.fromString(input.invitedBy)
    const roleId = RoleId.fromString(input.roleId)

    const workspace = await this.workspaceRepository.findById(workspaceId)

    if (!workspace) throw new WorkspaceNotFoundException()

    const role = await this.roleRepository.findById(roleId.value)

    const inviter = await this.userRepository.findById(inviterId)

    if (!inviter) throw new AccountNotFoundException()

    if (!role) throw new RoleNotFoundException()

    if (
      !role.isPredefined &&
      role.workspaceId &&
      !role.workspaceId.equals(workspaceId)
    )
      throw new RoleNotFoundException()

    const alreadyInvited =
      await this.invitationRepository.existsPendingInvitation(
        workspaceId,
        emailResult.value
      )

    if (alreadyInvited) throw new WorkspaceInvitationAlreadyExistsException()

    const existingUser = await this.userRepository.findByEmail(
      emailResult.value
    )

    if (existingUser) {
      const isMember = await this.workspaceRepository.isMember(
        workspaceId,
        existingUser.userId
      )

      if (isMember) throw new UserAlreadyWorkspaceMemberException()
    }

    const token = this.invitationService.generateToken() //TODO: Make the token a VO (workspace invitation token vo)

    const tokenHash = this.invitationService.hashToken(token)

    const invitation = WorkspaceInvitation.create({
      workspaceId,
      email: emailResult.value,
      roleId,
      invitedBy: inviterId,
      tokenHash,
    })

    await this.transactionmanager.executeTransaction(async (session) => {
      await this.invitationRepository.save(invitation, {
        session,
      })
    })

    await this.mailService.sendWorkspaceInvitationEmail(
      emailResult.value.value,
      {
        workspaceName: workspace.name,
        roleName: role.name.value,
        expiresInDays: 7,
        inviterName: inviter?.displayName,
        invitationUrl: this.invitationService.buildInvitationUrl(token),
      }
    )

    return {
      invitationId: invitation.id.value,
      email: invitation.email.value,
      expiresAt: invitation.expiresAt,
    }
  }
}
