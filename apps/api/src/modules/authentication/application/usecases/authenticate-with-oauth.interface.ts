import { AuthProvider } from '@/modules/user/domain'
import { OAuthInputDto, OAuthOutputDto } from '../dto'

export interface IAuthenticateWithOAuthUseCase {
  getRedirectUrl(provider: AuthProvider): string
  execute(input: OAuthInputDto): Promise<OAuthOutputDto>
}

export const AUTHENTICATE_WITH_OAUTH = Symbol('IAuthenticateWithOAuthUseCase')
