import { AuthProvider, UserStatus } from '@/modules/user/domain'

interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface AuthenticatedUser {
  id: string
  firstName: string
  lastName: string
  displayName: string
  email: string
  avatarUrl?: string
  emailVerified: boolean
  mfaEnabled: boolean
  authProvider: AuthProvider
  status: UserStatus
  preferences: {
    theme: string
    notifications: {
      email: boolean
      push: boolean
      inApp: boolean
    }
  }
  timezone: string
  locale: string
  lastLoginAt?: Date
  lastActiveAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface SignInResult {
  user: AuthenticatedUser
  tokens: Tokens
  sessionId: string
}
