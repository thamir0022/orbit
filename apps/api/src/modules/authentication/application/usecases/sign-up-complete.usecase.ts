import { Inject, Injectable, Logger } from '@nestjs/common'
import { type ISignUpCompleteUseCase } from './sign-up-complete.interface'
import {
  InCompleteSignUpSessionException,
  SignUpSessionNotFoundException,
} from '../../domain/exceptions/auth.exception'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  type IWorkspaceMemberRepository,
  type IWorkspaceRepository,
  WORKSPACE_MEMBER_REPOSITORY,
  WORKSPACE_REPOSITORY,
} from '@/modules/workspace/application'
import {
  AuthProvider,
  Email,
  InvalidEmailException,
  Password,
  User,
  AccountAlreadyExistsException,
} from '@/modules/user/domain'
import { Workspace, WorkspaceMember } from '@/modules/workspace/domain'
import {
  type SignUpCompleteInputDto,
  type SignUpCompleteOutputDto,
} from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import { WorkspaceAlreadyExistsException } from '@/modules/workspace/domain/exceptions/workspace.exception'

@Injectable()
export class SignUpCompleteUseCase implements ISignUpCompleteUseCase {
  private readonly logger = new Logger(SignUpCompleteUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(WORKSPACE_REPOSITORY)
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject(WORKSPACE_MEMBER_REPOSITORY)
    private readonly workspaceMemberRepository: IWorkspaceMemberRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly transactionManager: ITransactionManager,
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService
  ) {}

  async execute({
    registrationToken,
    clientInfo,
    ...org
  }: SignUpCompleteInputDto): Promise<SignUpCompleteOutputDto> {
    // 1. Fetch & Validate the Onboarding State
    const onboardingState =
      await this.authService.getOnboardingState(registrationToken)

    if (!onboardingState) {
      throw new SignUpSessionNotFoundException()
    }

    const { firstName, lastName, email, isEmailVerified, passwordHash } =
      onboardingState

    if (!firstName || !lastName || !email || !passwordHash) {
      throw new InCompleteSignUpSessionException()
    }

    const emailResult = Email.create(email)
    if (emailResult.isFailure) {
      await this.authService.completeOnboardingFlow(registrationToken) // Cleanup invalid state
      throw new InvalidEmailException(emailResult.error)
    }

    // 2. Pre-flight Checks (Fail fast before opening an expensive DB transaction)
    const isUserExist = await this.userRepository.existsByEmail(
      emailResult.value
    )
    if (isUserExist) {
      throw new AccountAlreadyExistsException(emailResult.value)
    }

    const isWorkspaceExists = await this.workspaceRepository.findBySlug(
      org.slug
    )
    if (isWorkspaceExists) {
      throw new WorkspaceAlreadyExistsException(org.slug)
    }

    // 3. Domain Entity Creation (Memory only)
    const newUser = User.create({
      firstName,
      lastName,
      email: emailResult.value,
      authProvider: AuthProvider.EMAIL,
      emailVerified: isEmailVerified,
      passwordHash: Password.fromHashed(passwordHash),
    })

    newUser.recordLogin()

    const newWorkspace = Workspace.create({
      name: org.name,
      slug: org.slug,
      defaultPlanId: '019c74bd-9862-7369-b600-0eed36827f90', // TODO: Resolve via Default Plan Service
      ownerId: newUser.id,
      companySize: org.companySize,
      companyType: org.companyType,
    })

    const workspaceAdminRoleId =
      await this.authService.getWorkspaceAdminRoleId()

    const newWorkspaceMember = WorkspaceMember.create({
      workspaceId: newWorkspace.id,
      userId: newUser.id,
      roleId: workspaceAdminRoleId,
    })

    // 4. ATOMIC DATABASE TRANSACTION
    await this.transactionManager.executeTransaction(async (session) => {
      await this.userRepository.save(newUser, { session: session })
      await this.workspaceRepository.save(newWorkspace, { session: session })
      await this.workspaceMemberRepository.save(newWorkspaceMember, {
        session: session,
      })
    })

    this.logger.log(
      `User ${newUser.id.value} and Workspace ${newWorkspace.id.value} created atomically.`
    )

    // 5. Post-Transaction Cleanup
    await this.authService.completeOnboardingFlow(registrationToken)

    // 6. Generate Cryptographic Identifiers for Global Identity
    const jti = this.authService.generateSecureToken()

    // 7. Initialize the Global Identity Session (Redis)
    const sid = await this.authService.createSession({
      userId: newUser.id,
      email: newUser.email,
      jti,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 8. Mint the Global Identity JWT
    const refreshToken = await this.authService.createRefreshToken({
      jti,
      sub: newUser.id.value,
      sid,
    })

    // 9. Extract precise expiration for the cookie configuration
    const expiresIn = this.authService.extractTokenExpiry(refreshToken)

    return {
      refreshToken,
      expiresIn,
      slug: newWorkspace.slug,
    }
  }
}
