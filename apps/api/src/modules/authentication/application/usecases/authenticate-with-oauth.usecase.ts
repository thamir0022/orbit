import { BadRequestException, Inject, Injectable } from '@nestjs/common'

import type { IAuthenticateWithOAuthUseCase } from './authenticate-with-oauth.interface'
import {
  OAUTH_FACTORY,
  type IOAuthFactory,
} from '../ports/oauth-factory.interface'

import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/modules/user/application'
import {
  AuthProvider,
  Email,
  InvalidEmailException,
  User,
} from '@/modules/user/domain'
import {
  USER_REGISTERED_EVENT,
  type UserRegisteredEvent,
} from '@/modules/user/application/events/user-registered.event'
import {
  APPLICATION_EVENT_PUBLISHER,
  type ApplicationEventPublisher,
} from '@/shared/application/events/application-event-publisher.port'

import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import type { OAuthInputDto, OAuthOutputDto } from '../dto'

/**
 * Authenticates users through a supported OAuth provider.
 *
 * - Resolves or creates the user account.
 * - Publishes registration only for newly persisted users.
 * - Establishes authenticated sessions for both new and existing accounts.
 */
@Injectable()
export class AuthenticateWithOAuthUseCase implements IAuthenticateWithOAuthUseCase {
  constructor(
    @Inject(OAUTH_FACTORY)
    private readonly oauthFactory: IOAuthFactory,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,

    @Inject(APPLICATION_EVENT_PUBLISHER)
    private readonly eventPublisher: ApplicationEventPublisher
  ) {}

  /** Returns the authorization URL for the selected OAuth provider. */
  getRedirectUrl(provider: AuthProvider): string {
    const oauthProvider = this.oauthFactory.getProvider(provider)

    return oauthProvider.getAuthUrl()
  }

  /** Authenticates an OAuth user, registering the account when necessary. */
  async execute(input: OAuthInputDto): Promise<OAuthOutputDto> {
    const { code, provider, clientInfo } = input

    // 1. Validate the OAuth authorization code.
    const oauthProvider = this.oauthFactory.getProvider(provider)

    const oauthUser = await oauthProvider.validateAuthCode(code)

    const oauthUserEmail = Email.create(oauthUser.email)

    if (oauthUserEmail.isFailure) {
      throw new InvalidEmailException(oauthUserEmail.error)
    }

    // 2. Resolve the existing user account.
    let user = await this.userRepository.findByEmail(oauthUserEmail.value)

    if (user && user.authProvider !== AuthProvider.GOOGLE) {
      throw new BadRequestException(
        `Your account is already linked with ${user.authProvider}, Please sign in with ${user.authProvider}.`
      )
    }

    // 3. Create the account when authenticating for the first time.
    let isNewUser = false

    if (!user) {
      user = User.create({
        firstName: oauthUser.firstName,
        lastName: oauthUser.lastName,
        email: oauthUserEmail.value,
        authProvider: oauthUser.provider,
        avatarUrl: oauthUser.avatarUrl,
        emailVerified: oauthUser.emailVerified,
        oauthProviderId: oauthUser.providerId,
      })

      await this.userRepository.save(user)

      isNewUser = true

      // 4. Publish registration only after the new account is persisted.
      this.eventPublisher.publish(USER_REGISTERED_EVENT, {
        userId: user.id.value,
      } satisfies UserRegisteredEvent)
    }

    // 5. Create an authenticated Redis session.
    const jti = this.authService.generateSecureToken()

    const sid = await this.authService.createSession({
      userId: user.id,
      jti,
      email: user.email,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // 6. Generate refresh credentials.
    const refreshToken = await this.authService.createRefreshToken({
      jti,
      sub: user.id.value,
      sid,
    })

    const expiresIn = this.authService.extractTokenExpiry(refreshToken)

    return {
      isNewUser,
      refreshToken,
      expiresIn,
    }
  }
}
