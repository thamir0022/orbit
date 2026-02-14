import { BadRequestException, Inject, Injectable } from '@nestjs/common'
import { IOAuthProvider, OAuthUser } from '../../application'
import { OAuth2Client } from 'google-auth-library'
import {
  type IOAuthConfig,
  OAUTH_CONFIG,
} from '../interfaces/oauth.config.interface'
import { AuthProvider } from '@/modules/user/domain'

@Injectable()
export class GoogleOAuthProvider implements IOAuthProvider {
  private client: OAuth2Client

  constructor(
    @Inject(OAUTH_CONFIG)
    private readonly _config: IOAuthConfig
  ) {
    this.client = new OAuth2Client(
      this._config.googleClientId,
      this._config.googleClientSecret,
      this._config.googleCallbackUrl
    )
  }

  getAuthUrl(): string {
    return this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['email', 'profile'],
      prompt: 'consent',
    })
  }

  async validateAuthCode(code: string): Promise<OAuthUser> {
    const { tokens } = await this.client.getToken(code)

    if (!tokens.id_token)
      throw new BadRequestException(
        'Failed to retrieve authentication token from Google'
      )

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this._config.googleClientId,
    })

    const payload = ticket.getPayload()

    if (!payload)
      throw new BadRequestException(
        'Failed to extract user information from Google token'
      )

    return {
      provider: AuthProvider.GOOGLE,
      providerId: payload.sub,
      firstName: payload.given_name ?? payload.name?.split(' ')?.at(0) ?? '',
      lastName: payload.family_name ?? payload.name?.split(' ')?.at(1) ?? '',
      email: payload.email!,
      emailVerified: payload.email_verified ?? false,
      avatarUrl: payload.picture,
    }
  }
}
