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
  AuthProvider,
  Email,
  InvalidEmailException,
  User,
} from '@/modules/user/domain'
import {
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { OAuthRequestDto, OAuthResponseDto } from '../dto'

@Injectable()
export class AuthenticateWithOAuthUseCase implements IAuthenticateWithOAuthUseCase {
  constructor(
    @Inject(OAUTH_FACTORY)
    private readonly _oauthFactory: IOAuthFactory,
    @Inject(USER_REPOSITORY)
    private readonly _userRepository: IUserRepository,
    @Inject(AUTH_SERVICE)
    private readonly _authService: IAuthService
  ) {}

  getRedirectUrl(provider: AuthProvider): string {
    const oauthProvider = this._oauthFactory.getProvider(provider)
    return oauthProvider.getAuthUrl()
  }

  async execute(dto: OAuthRequestDto): Promise<OAuthResponseDto> {
    const oauthProvider = this._oauthFactory.getProvider(dto.provider)

    const oauthUser = await oauthProvider.validateAuthCode(dto.code)

    const oauthUserEmail = Email.create(oauthUser.email)

    if (oauthUserEmail.isFailure)
      throw new InvalidEmailException(oauthUserEmail.error)

    let user = await this._userRepository.findByEmail(oauthUserEmail.value)

    if (user && user.authProvider !== AuthProvider.GOOGLE)
      throw new BadRequestException(
        `Your account is already linked with ${user.authProvider}, Please sign in with ${user.authProvider}.`
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
    const refreshTokenId = this._authService.createRefreshTokenId()

    // Create session
    const sessionId = await this._authService.createAuthSession({
      userId: user.id,
      jti: refreshTokenId,
      email: user.email,
      ipAddress: dto.clientInfo.ipAddress,
      userAgent: dto.clientInfo.userAgent,
    })

    // Generate refresh token
    const refreshToken = await this._authService.createRefreshToken({
      jti: refreshTokenId,
      sub: user.id.value,
      sid: sessionId,
    })

    const expiresIn = this._authService.extractRefreshTokenExpiry(refreshToken)

    return {
      refreshToken,
      expiresIn,
    }
  }
}
