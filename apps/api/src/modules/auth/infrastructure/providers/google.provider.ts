import { Inject, Injectable } from '@nestjs/common'
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

    if (!tokens.id_token) throw new Error() // Throw a sepecific exception

    const ticket = await this.client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this._config.googleClientId,
    })

    const payload = ticket.getPayload()

    if (!payload) throw new Error() // Throw a sepecific exception

    return {
      provider: AuthProvider.GOOGLE,
      providerId: payload.sub,
      firstName: payload.given_name!,
      lastName: payload.family_name ?? payload.name?.split(' ')[1] ?? '',
      email: payload.email!,
      emailVerified: payload.email_verified!,
      avatarUrl: payload.profile ?? '',
    }
  }
}
