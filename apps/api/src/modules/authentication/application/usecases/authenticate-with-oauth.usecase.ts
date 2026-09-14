import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { type IAuthenticateWithOAuthUseCase } from './authenticate-with-oauth.interface'
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
  AUTH_SERVICE,
  type IAuthService,
} from '../services/auth.service.interface'
import { OAuthInputDto, OAuthOutputDto } from '../dto'

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

  async execute(input: OAuthInputDto): Promise<OAuthOutputDto> {
    const { code, provider, clientInfo } = input
    const oauthProvider = this._oauthFactory.getProvider(provider)

    const oauthUser = await oauthProvider.validateAuthCode(code)

    const oauthUserEmail = Email.create(oauthUser.email)

    if (oauthUserEmail.isFailure)
      throw new InvalidEmailException(oauthUserEmail.error)

    let user = await this._userRepository.findByEmail(oauthUserEmail.value)

    let newUser = false

    if (user && user.authProvider !== AuthProvider.GOOGLE)
      throw new BadRequestException(
        `Your account is already linked with ${user.authProvider}, Please sign in with ${user.authProvider}.`
      )

    if (!user) {
      newUser = true

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

    // Generate a Refresh Token ID
    const jti = this._authService.generateSecureToken()

    // Create session
    const sid = await this._authService.createSession({
      userId: user.id,
      jti,
      email: user.email,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
    })

    const refreshToken = await this._authService.createRefreshToken({
      jti,
      sub: user.id.value,
      sid,
    })

    const expiresIn = this._authService.extractTokenExpiry(refreshToken)

    return {
      isNewUser: newUser,
      refreshToken,
      expiresIn,
    }
  }
}
