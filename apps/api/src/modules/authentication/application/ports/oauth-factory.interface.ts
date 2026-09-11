import { AuthProvider } from '@/modules/user/domain'

export interface OAuthUser {
  provider: AuthProvider
  providerId: string
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  avatarUrl?: string
}

export interface IOAuthProvider {
  getAuthUrl(): string
  validateAuthCode(code: string): Promise<OAuthUser>
}

export interface IOAuthFactory {
  getProvider(provider: AuthProvider): IOAuthProvider
}

export const OAUTH_FACTORY = Symbol('IOAuthFactory')
