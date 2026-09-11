import { Inject, Injectable, Logger } from '@nestjs/common'
import { CompleteRegistrationInput, CompleteRegistrationOutput } from '../dto'
import { ICompleteRegistrationUseCase } from './complete-registration.interface'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { SignUpSessionNotFoundException } from '../../domain/exceptions/auth.exception'
import {
  AccountAlreadyExistsException,
  AuthProvider,
  Email,
  InvalidEmailException,
  InvalidPasswordException,
  Password,
  User,
} from '@/modules/user/domain'
import {
  type IWorkspaceInvitationRepository,
  WORKSPACE_INVITATION_REPOSITORY,
} from '@/modules/workspace/application/repository/workspace-invitation.repository.interface'
import {
  UserAlreadyWorkspaceMemberException,
  WorkspaceInvitationNotFoundException,
  WorkspaceNotActiveException,
  WorkspaceNotFoundException,
} from '@/modules/workspace/domain/exceptions/workspace.exception'
import {
  WorkspaceMember,
  WorkspaceMemberStatus,
  WorkspaceStatus,
} from '@/modules/workspace/domain'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/modules/user/application'
import {
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
  type IWorkspaceMemberRepository,
  type IWorkspaceRepository,
} from '@/modules/workspace/application'
import {
  type IWorkspaceInvitationService,
  WORKSPACE_INVITATION_SERVICE,
} from '@/modules/workspace/application/services/workspace-invitation.service.interface'

@Injectable()
export class CompleteRegistrationUseCase implements ICompleteRegistrationUseCase {
  private readonly logger = new Logger(CompleteRegistrationUseCase.name)

  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_INVITATION_REPOSITORY)
    private readonly workspaceInvitationRepository: IWorkspaceInvitationRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    @Inject(WORKSPACE_INVITATION_SERVICE)
    private readonly invitationService: IWorkspaceInvitationService,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager
  ) {}

  async execute({
    registrationToken,
    invitationToken,
    firstName,
    lastName,
    password,
    clientInfo,
  }: CompleteRegistrationInput): Promise<CompleteRegistrationOutput> {
    const signUpSession =
      await this.authService.getOnboardingState(registrationToken)

    if (!signUpSession) throw new SignUpSessionNotFoundException()

    const emailResult = Email.create(signUpSession.email)

    if (emailResult.isFailure)
      throw new InvalidEmailException(emailResult.error)

    const passwordResult = Password.create(password)

    if (passwordResult.isFailure)
      throw new InvalidPasswordException(passwordResult.error)

    const tokenHash = this.invitationService.hashToken(invitationToken)

    const invitation =
      await this.workspaceInvitationRepository.findByTokenHash(tokenHash)

    if (!invitation) throw new WorkspaceInvitationNotFoundException()

    const workspace = await this.workspaceRepository.findById(
      invitation.workspaceId
    )

    if (!workspace) throw new WorkspaceNotFoundException()

    if (workspace.status !== WorkspaceStatus.ACTIVE)
      throw new WorkspaceNotActiveException(workspace.status)

    const existingUser = await this.userRepository.findByEmail(
      emailResult.value
    )

    if (existingUser) throw new AccountAlreadyExistsException(emailResult.value)

    const existingMember = await this.workspaceMemberRepository.exists({
      workspaceId: invitation.workspaceId,
      email: emailResult.value,
    })

    if (existingMember) throw new UserAlreadyWorkspaceMemberException()

    const passwordHash = await this.authService.hashPassword(
      passwordResult.value
    )

    const newUser = User.create({
      firstName,
      lastName,
      email: emailResult.value,
      emailVerified: signUpSession.isEmailVerified,
      passwordHash: Password.fromHashed(passwordHash),
      authProvider: AuthProvider.EMAIL,
    })

    newUser.recordLogin()

    const newWorkspaceMember = WorkspaceMember.create({
      userId: newUser.id,
      workspaceId: invitation.workspaceId,
      roleId: invitation.roleId,
      invitedAt: invitation.createdAt,
      invitedBy: invitation.invitedBy.value,
      joinedAt: new Date(),
      status: WorkspaceMemberStatus.ACTIVE,
    })

    invitation.accept(emailResult.value)

    await this.transactionManager.executeTransaction(async (session) => {
      await this.userRepository.save(newUser, { session })
      await this.workspaceMemberRepository.save(newWorkspaceMember, { session })
      await this.workspaceInvitationRepository.save(invitation, { session })
    })

    this.logger.log(
      `Workspace member registered. workspaceId=${workspace.id.value}, userId=${newUser.id.value}, invitationId=${invitation.id.value}`
    )

    await this.authService.completeOnboardingFlow(registrationToken)

    const jti = this.authService.generateSecureToken()

    const sid = await this.authService.createSession({
      userId: newUser.id,
      email: newUser.email,
      jti,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    const refreshToken = await this.authService.createRefreshToken({
      jti,
      sub: newUser.id.value,
      sid,
    })

    const expiresIn = this.authService.extractTokenExpiry(refreshToken)

    return {
      slug: workspace.slug,
      refreshToken,
      expiresIn,
    }
  }
}
