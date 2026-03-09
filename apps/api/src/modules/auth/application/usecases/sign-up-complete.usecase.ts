import { Inject, Injectable, Logger } from '@nestjs/common'
import { ISignUpCompleteUseCase } from './sign-up-complete.interface'
import {
  InCompleteSignUpSessionException,
  SignUpSessionNotFoundException,
} from '../../domain/exceptions/auth.exception'
import {
  type IUserRepository,
  USER_REPOSITORY,
} from '@/modules/user/application'
import {
  type IOrganizationMemberRepository,
  type IOrganizationRepository,
  ORGANIZATION_MEMBER_REPOSITORY,
  ORGANIZATION_REPOSITORY,
} from '@/modules/organization/application'
import {
  AuthProvider,
  Email,
  InvalidEmailException,
  Password,
  User,
  UserAlreadyExistsException,
} from '@/modules/user/domain'
import { Organization, OrganizationMember } from '@/modules/organization/domain' // Updated
import { SignUpCompleteRequestDto, SignUpCompleteResponseDto } from '../dto'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import {
  type ITransactionManager,
  TRANSACTION_MANAGER,
} from '@/shared/application'
import { OrganizationAlreadyExistsException } from '@/modules/organization/domain/exceptions/organization.exception'

@Injectable()
export class SignUpCompleteUseCase implements ISignUpCompleteUseCase {
  private readonly _logger = new Logger(SignUpCompleteUseCase.name)

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly _organizationRepository: IOrganizationRepository,
    @Inject(ORGANIZATION_MEMBER_REPOSITORY)
    private readonly _organizationMemberRepository: IOrganizationMemberRepository,
    @Inject(TRANSACTION_MANAGER)
    private readonly _transactionManager: ITransactionManager,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  async execute(
    dto: SignUpCompleteRequestDto
  ): Promise<SignUpCompleteResponseDto> {
    const { registrationToken, clientInfo, ...org } = dto

    // 1. Fetch & Validate Session
    const signUpSession =
      await this._authService.getSignUpSession(registrationToken)
    if (!signUpSession) throw new SignUpSessionNotFoundException()

    const { firstName, lastName, email, isEmailVerified, passwordHash } =
      signUpSession
    if (!firstName || !lastName || !email || !passwordHash) {
      throw new InCompleteSignUpSessionException()
    }

    const emailResult = Email.create(email)
    if (emailResult.isFailure) {
      await this._authService.deleteSignUpSession(registrationToken)
      throw new InvalidEmailException(emailResult.error)
    }

    // 2. Pre-flight Checks (Fail fast before opening a transaction)
    const isUserExist = await this._userRepository.existsByEmail(
      emailResult.value
    )
    if (isUserExist) throw new UserAlreadyExistsException(emailResult.value)

    const isOrgExists = await this._organizationRepository.findBySubdomain(
      org.subdomain
    )

    if (isOrgExists) throw new OrganizationAlreadyExistsException(org.subdomain)

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

    const newOrganization = Organization.create({
      name: org.name,
      subdomain: org.subdomain,
      defaultPlanId: '019c74bd-9862-7369-b600-0eed36827f90', // TODO: done by default plan service later
      ownerId: newUser.id,
      companySize: org.companySize,
      companyType: org.companyType,
    })

    const newOrgMember = OrganizationMember.create({
      organizationId: newOrganization.id,
      userId: newUser.id,
      roleId: '019c74bd-9862-7369-b600-0eed36827f90', // TODO: done by RBAC module later
    })

    // 4. ATOMIC DATABASE TRANSACTION
    await this._transactionManager.executeTransaction(
      async (sessionContext) => {
        await this._userRepository.save(newUser, { session: sessionContext })
        await this._organizationRepository.save(newOrganization, {
          session: sessionContext,
        })
        await this._organizationMemberRepository.save(newOrgMember, {
          session: sessionContext,
        })
      }
    )

    this._logger.log(
      `User ${newUser.id.value} and Organization ${newOrganization.id.value} created atomically.`
    )

    // 5. Post-Transaction cleanup and Token Generation
    await this._authService.deleteSignUpSession(registrationToken)

    const refreshTokenId = this._authService.createRefreshTokenId()

    const sessionId = await this._authService.createAuthSession({
      userId: newUser.id,
      jti: refreshTokenId,
      email: newUser.email,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    const refreshToken = await this._authService.createRefreshToken({
      jti: refreshTokenId,
      sub: newUser.id.value,
      sid: sessionId,
    })

    const expiresIn = this._authService.extractRefreshTokenExpiry(refreshToken)

    return {
      organizationId: newOrganization.id.value,
      refreshToken,
      expiresIn,
    }
  }
}
