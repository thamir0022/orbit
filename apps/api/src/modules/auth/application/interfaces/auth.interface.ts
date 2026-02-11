import { AuthProvider, UserStatus } from '@/modules/user/domain'

export interface Tokens {
  accessToken: string
  refreshToken: string
}

export interface ClientInfo {
  ipAddress: string
  userAgent: string
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
