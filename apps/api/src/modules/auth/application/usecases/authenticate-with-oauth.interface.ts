import { AuthProvider } from '@/modules/user/domain'
import { OAuthRequestDto, OAuthResponseDto } from '../dto'
export interface IAuthenticateWithOAuthUseCase {
  getRedirectUrl(provider: AuthProvider): string
  execute(dto: OAuthRequestDto): Promise<OAuthResponseDto>
}

export const AUTHENTICATE_WITH_OAUTH = Symbol('IAuthenticateWithOAuthUseCase')
