import { AuthProvider } from '@/modules/user/domain'
import { OAuthCommand } from '../dto/oauth.command'
import { OAuthResult } from '../dto/oauth.result'

export interface IAuthenticateWithOAuthUseCase {
  getRedirectUrl(provider: AuthProvider): string
  execute(command: OAuthCommand): Promise<OAuthResult>
}

export const AUTHENTICATE_WITH_OAUTH = Symbol('IAuthenticateWithOAuthUseCase')
