import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { type IAuthenticateWithOAuthUseCase } from './authenticate-with-oauth.interface'
import {
  OAUTH_FACTORY,
  type IOAuthFactory,
} from '../repositories/oauth-factory.interface'
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '@/modules/user/application'
import {
  TOKEN_GENERATOR,
  type ITokenGenerator,
} from '../repositories/token-generator.interface'
import {
  AuthProvider,
  Email,
  InvalidEmailException,
  User,
} from '@/modules/user/domain'
import { OAuthCommand } from '../dto/oauth.command'
import { OAuthResult } from '../dto/oauth.result'
import { UuidUtil } from '@/shared/utils'
import {
  type ISessionManager,
  SESSION_MANAGER,
} from '../repositories/session-manager.interface'
import { UserMapper } from '@/modules/user/application/mappers/user.mapper'

@Injectable()
export class AuthenticateWithOAuthUseCase implements IAuthenticateWithOAuthUseCase {
  constructor(
    @Inject(OAUTH_FACTORY)
    private readonly _oauthFactory: IOAuthFactory,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(TOKEN_GENERATOR)
    private readonly _tokenGenerator: ITokenGenerator,
    @Inject(SESSION_MANAGER)
    private readonly _sessionManager: ISessionManager
  ) {}

  getRedirectUrl(provider: AuthProvider): string {
    const oauthProvider = this._oauthFactory.getProvider(provider)
    return oauthProvider.getAuthUrl()
  }

  async execute(command: OAuthCommand): Promise<OAuthResult> {
    const { provider, code, clientInfo } = command
    const oauthProvider = this._oauthFactory.getProvider(provider)

    const oauthUser = await oauthProvider.validateAuthCode(code)

    const oauthUserEmail = Email.create(oauthUser.email)

    if (oauthUserEmail.isFailure)
      throw new InvalidEmailException(oauthUserEmail.error)

    let user = await this._userRepository.findByEmail(oauthUserEmail.value)

    if (user && user.authProvider !== AuthProvider.GOOGLE)
      throw new BadRequestException(
        `Your account is already linked with ${user.authProvider}, Please sign in with that.`
      )

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

      await this._userRepository.save(user)
    }

    // Generate a refresh token ID
    const refreshTokenId = UuidUtil.generate()

    // Create session
    const sessionId = await this._sessionManager.createSession({
      userId: user.id.value,
      jti: refreshTokenId,
      email: user.email.value,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    // Generate access token
    const accessToken = this._tokenGenerator.generateAccessToken({
      jti: UuidUtil.generate(),
      sub: user.id.value,
      sid: sessionId,
      email: user.email.value,
    })

    // Generate refresh token
    const refreshToken = this._tokenGenerator.generateRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    return {
      user: UserMapper.toResponseDto(user),
      tokens: {
        accessToken,
        refreshToken,
      },
      sessionId,
    }
  }
}
